const https = require('https');

const target = process.argv[2] === 'prod' ? 'publico' : 'borrador';
const url = `https://neblina105fm.com/deploy.php?key=Neblina2026_SecureDeployKey!%40%23&action=${target}`;

console.log(`📡 Disparando webhook de despliegue para: [${target.toUpperCase()}]...`);

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Respuesta del servidor (${res.statusCode}):`);
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch {
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error('Error al conectar con el servidor:', err.message);
});
