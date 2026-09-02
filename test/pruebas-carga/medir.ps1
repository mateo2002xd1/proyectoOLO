<#
.SYNOPSIS
  Muestrea el consumo de cada contenedor mientras corre una prueba de carga.

.DESCRIPTION
  `docker stats` sin `--no-stream` pinta una tabla que se refresca sola y no sirve para
  analizar después. Este script toma muestras puntuales cada N segundos y las acumula
  en un CSV, que es lo que permite cruzar "en el escalón de 300 VUs, la API estaba en
  X MB y Y% de CPU".

  Sin esta captura la prueba de carga solo diría si el sistema aguanta o no. Con ella
  se puede responder la pregunta que de verdad importa: CUÁNTO recurso costó aguantar,
  que es lo que se traslada a la solicitud al área de infraestructura.

  Un aviso sobre el porcentaje de CPU: `docker stats` lo reporta sobre el total de
  núcleos del host, así que 200% significa "dos núcleos completos", no "el doble del
  máximo". Con 12 núcleos el techo es 1200%.

.PARAMETER Salida
  Ruta del CSV. Por defecto queda bajo resultados/ con la marca de tiempo.

.PARAMETER IntervaloSegundos
  Cada cuánto se toma la muestra. 2 s da resolución suficiente para ver los escalones
  del ramp sin generar un CSV inmanejable.

.PARAMETER DuracionMinutos
  Cuánto tiempo muestrear. Debe cubrir la corrida completa de k6 más un margen.

.EXAMPLE
  .\medir.ps1 -DuracionMinutos 20 -Salida resultados\publico-stats.csv
#>
param(
  [string]$Salida = "",
  [int]$IntervaloSegundos = 2,
  [int]$DuracionMinutos = 20
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Salida)) {
  $marca = Get-Date -Format "yyyyMMdd-HHmmss"
  $Salida = Join-Path $PSScriptRoot "resultados\stats-$marca.csv"
}

$directorio = Split-Path -Parent $Salida
if (-not (Test-Path $directorio)) { New-Item -ItemType Directory -Path $directorio -Force | Out-Null }

"marca_tiempo,contenedor,cpu_pct,mem_usada_mb,mem_limite_mb,mem_pct,red_entrada,red_salida,bloque_lectura,bloque_escritura,pids" |
  Out-File -FilePath $Salida -Encoding utf8

Write-Output "Muestreando cada $IntervaloSegundos s durante $DuracionMinutos min -> $Salida"

$fin = (Get-Date).AddMinutes($DuracionMinutos)
$muestras = 0

# Convierte "1.234GiB" / "512MiB" / "1.2kB" a MB. Docker mezcla unidades binarias
# (memoria) y decimales (red y disco) en la misma tabla, y sin normalizar las
# columnas no se pueden sumar ni graficar.
function ConvertTo-Megabytes([string]$valor) {
  if ([string]::IsNullOrWhiteSpace($valor)) { return 0 }
  $v = $valor.Trim()
  if ($v -match '^([\d\.]+)\s*([A-Za-z]+)$') {
    $numero = [double]$Matches[1]
    switch ($Matches[2].ToLower()) {
      'b'   { return [math]::Round($numero / 1MB, 3) }
      'kb'  { return [math]::Round($numero / 1000, 3) }
      'kib' { return [math]::Round($numero / 1024, 3) }
      'mb'  { return [math]::Round($numero, 3) }
      'mib' { return [math]::Round($numero * 1.048576, 3) }
      'gb'  { return [math]::Round($numero * 1000, 3) }
      'gib' { return [math]::Round($numero * 1073.741824, 3) }
      default { return $numero }
    }
  }
  return 0
}

while ((Get-Date) -lt $fin) {
  $marca = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"

  # --no-stream toma UNA muestra y sale. Es lo que permite temporizar el muestreo
  # nosotros en vez de depender del refresco interno de docker.
  $lineas = docker stats --no-stream --format "{{.Name}};{{.CPUPerc}};{{.MemUsage}};{{.MemPerc}};{{.NetIO}};{{.BlockIO}};{{.PIDs}}" 2>$null

  if ($LASTEXITCODE -eq 0 -and $lineas) {
    foreach ($linea in $lineas) {
      $campos = $linea -split ';'
      if ($campos.Count -lt 7) { continue }

      $nombre = $campos[0]
      $cpu = $campos[1] -replace '%', ''
      $memPartes = $campos[2] -split '/'
      $memUsada = ConvertTo-Megabytes $memPartes[0]
      $memLimite = if ($memPartes.Count -gt 1) { ConvertTo-Megabytes $memPartes[1] } else { 0 }
      $memPct = $campos[3] -replace '%', ''
      $redPartes = $campos[4] -split '/'
      $redEntrada = ConvertTo-Megabytes $redPartes[0]
      $redSalida = if ($redPartes.Count -gt 1) { ConvertTo-Megabytes $redPartes[1] } else { 0 }
      $bloquePartes = $campos[5] -split '/'
      $bloqueLectura = ConvertTo-Megabytes $bloquePartes[0]
      $bloqueEscritura = if ($bloquePartes.Count -gt 1) { ConvertTo-Megabytes $bloquePartes[1] } else { 0 }
      $pids = $campos[6]

      "$marca,$nombre,$cpu,$memUsada,$memLimite,$memPct,$redEntrada,$redSalida,$bloqueLectura,$bloqueEscritura,$pids" |
        Out-File -FilePath $Salida -Encoding utf8 -Append
    }
    $muestras++
  }

  Start-Sleep -Seconds $IntervaloSegundos
}

Write-Output "Listo: $muestras rondas de muestreo en $Salida"
