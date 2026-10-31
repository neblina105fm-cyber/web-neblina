const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const themeScript = `<script>
      (function() {
        try {
          var saved = localStorage.getItem('neblina_theme');
          var manual = localStorage.getItem('neblina_theme_manual');
          var isDark = true;
          if (manual && (saved === 'dark' || saved === 'light')) {
            isDark = (saved === 'dark');
          } else if (window.matchMedia) {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          }
          if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          }
        } catch(e) {}
      })();
    </script>`;

if (!code.includes('neblina_theme_manual')) {
  code = code.replace('<head>', '<head>\n    ' + themeScript);
  fs.writeFileSync('index.html', code, 'utf8');
  console.log('Added initial anti-flicker device theme detection script to index.html');
} else {
  console.log('Theme script already in index.html');
}
