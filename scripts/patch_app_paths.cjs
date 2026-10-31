const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetManifest = `    if (smartTvOpen) {
      manifestUrl = '/manifest-tv.json';
      appTitle = 'Neblina 105.5 · Smart TV';
    } else if (adminOpen) {
      manifestUrl = '/manifest-admin.json';
      appTitle = 'Neblina 105.5 · Sistema Interno';
    } else if (clientPortalOpen) {
      manifestUrl = '/manifest-clientes.json';
      appTitle = 'Neblina 105.5 · Portal Aliados Comerciales';
    } else if (staffPortalOpen) {
      manifestUrl = '/manifest-locutores.json';
      appTitle = 'Neblina 105.5 · Portal Locutores & Ventas';
    } else if (journalistPortalOpen) {
      manifestUrl = '/manifest-periodistas.json';
      appTitle = 'Neblina 105.5 · Portal Periodistas & Redacción';
    }`;

const replacementManifest = `    if (smartTvOpen) {
      manifestUrl = './manifest-tv.json';
      appTitle = 'Neblina 105.5 · Smart TV';
    } else if (adminOpen) {
      manifestUrl = './manifest-admin.json';
      appTitle = 'Neblina 105.5 · Sistema Interno';
    } else if (clientPortalOpen) {
      manifestUrl = './manifest-clientes.json';
      appTitle = 'Neblina 105.5 · Portal Aliados Comerciales';
    } else if (staffPortalOpen) {
      manifestUrl = './manifest-locutores.json';
      appTitle = 'Neblina 105.5 · Portal Locutores & Ventas';
    } else if (journalistPortalOpen) {
      manifestUrl = './manifest-periodistas.json';
      appTitle = 'Neblina 105.5 · Portal Periodistas & Redacción';
    }`;

content = content.replace(targetManifest, replacementManifest);
content = content.replace("let manifestUrl = '/manifest.json';", "let manifestUrl = './manifest.json';");

// Reemplazar window.history.replaceState(null, '', '/'); por window.history.replaceState(null, '', window.location.pathname.replace(/\/(admin|clientes|aliados|locutores|periodistas|redaccion)$/, '') || window.location.pathname);
content = content.split("window.history.replaceState(null, '', '/');").join("window.history.replaceState(null, '', window.location.pathname.replace(/\\/(admin|clientes|aliados|locutores|periodistas|redaccion)$/, '') || window.location.pathname);");

fs.writeFileSync('src/App.jsx', content, 'utf8');
console.log('App.jsx manifests and relative paths updated cleanly!');
