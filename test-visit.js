fetch('http://localhost:4000/api/paginas/visitas/registrar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Ambito': 'intranet'
  },
  body: JSON.stringify({ slug: 'matriz', ambito: 'intranet' })
})
.then(r => r.json().then(data => ({ status: r.status, data })))
.then(console.log)
.catch(console.error);
