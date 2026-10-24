# OLO — instrucciones para cualquier sesión

Pila: `3000-sitio-web` y `3001-intranet` (Next + Puck), `4000-api-backend` (Express, **no** Nest), Postgres en Neon, Redis, Docker. Las reglas viven en `docs/` (orden de lectura: `1-guia-del-proyecto.md`, luego el `.md` del tema).

## Agentes (`.claude/agents/`)

Un agente arranca en frío y cuesta más que una skill. **No se lanzan solos**: solo si el usuario lo pide o si el caso está en esta tabla.

| Cuándo | Qué usar |
|---|---|
| El usuario escribe `/auditar` | Los cuatro `auditor-*` (los lanza esa skill; no se llaman sueltos) |
| Decisión de riesgo con varias salidas (permisos, ciclo editorial, borrar datos, cambiar el modelo de sesión) | `llm-council` (el consejo) y, si toca código, los `auditor-*` antes de aplicar |
| El usuario pide una prueba de intrusión sobre algo del proyecto | `penetration-tester`, solo contra el entorno desechable (ver memoria «Probar sin tocar Neon ni el dev») |
| El usuario pide revisión de seguridad por controles, sin explotar | `security-auditor`, `api-security-audit` |
| Accesibilidad de una pantalla pública | `accessibility`, `web-accessibility-checker` |
| Rediseño o crítica visual con capturas | `ui-ux-designer` (solo lee; el cambio lo hago yo) |
| Consultas lentas o índices en Neon | `database-optimizer` |
| Modelo de datos nuevo o migración grande | `database-architect` (diseña; la migración la corre el usuario) |
| Dependencias con avisos o conflictos | `dependency-manager` |

`backend-architect`, `backend-developer`, `frontend-developer`, `fullstack-developer`, `deployment-engineer` y `devops-engineer` solo si el usuario los nombra: el código del OLO ya tiene convenciones propias y se edita en la sesión principal.

## Skills (`.claude/skills/`)

Estas sí se usan sin que se pidan, cuando la tarea encaja:

- **Seguridad de código del proyecto:** `security-best-practices`, `api-security-best-practices`, `broken-authentication`, `idor-testing`, `xss-html-injection`, `html-injection-testing`, `sql-injection-testing`, `file-path-traversal`, `file-uploads`, `web-security-testing`, `top-web-vulnerabilities`. Las pruebas se corren en la batería del API (`npm run *:verificar`), no contra Neon.
- **Calidad:** `code-reviewer`, `clean-code`, `accessibility`, `webapp-testing` (Playwright contra el dev local).
- **Diseño:** `senior-architect`, `architecture-patterns`, `software-architecture`, `api-patterns`, `database-schema-designer`, `senior-backend`, `senior-frontend`.
- **Infra y shell:** `docker-expert`, `powershell-windows` (la máquina es Windows), `bash-linux` (solo para scripts que corren en el servidor), `mermaid-diagram-specialist` (diagramas en `docs/diagramas/`).

Solo si el usuario las nombra, porque son de pentesting ofensivo genérico y el proyecto no tiene esa superficie: `metasploit-framework`, `active-directory-attacks`, `smtp-penetration-testing`, `ssh-penetration-testing`, `linux-privilege-escalation`, `wireshark-analysis`, `burp-suite-testing`, `pentest-commands`, `pentest-checklist`, `sqlmap-database-pentesting`, `vulnerability-scanner`, `sast-configuration`, `security-audit`, `senior-security`, `incident-reporting-navigator`, `security-ownership-map`, `api-security-testing`.

`nestjs-expert` no aplica: el API es Express.

## Siempre

- Responder en español.
- Tocar solo la pantalla o el archivo que el usuario nombra; si es ambiguo, preguntar.
- No commitear ni subir: dejar al final los comandos de commit, sin `Co-Authored-By`.
- Toda entrega lleva su entrada en `docs/6-auditoria.md`.
- Migraciones: no se aplican a Neon; se deja `npm run migrate` al usuario.
- `docs/13-mapa-del-proyecto.md` lo genera el pre-commit; no se edita a mano.
