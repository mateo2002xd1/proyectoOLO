fetch('http://localhost:4000/health')
.then(r => r.text().then(data => ({ status: r.status, data })))
.then(console.log)
.catch(console.error);
