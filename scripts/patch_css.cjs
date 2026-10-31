const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('button:active:not(:disabled),', 'button:active:not(:disabled):not(.input-password-toggle-btn),');
css = css.replace('button:hover:not(:disabled):not(.no-hover-lift),', 'button:hover:not(:disabled):not(.no-hover-lift):not(.input-password-toggle-btn),');

const targetStr = '.input-password-toggle-btn {';
const idx = css.indexOf(targetStr);
if (idx !== -1) {
  const closeIdx = css.indexOf('}', idx);
  const replacement = `.input-password-toggle-btn {
  position: absolute !important;
  right: 12px !important;
  top: 0 !important;
  bottom: 0 !important;
  margin: auto 0 !important;
  height: 28px !important;
  width: 28px !important;
  transform: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 30 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  padding: 0 !important;
  cursor: pointer !important;
}

.input-password-toggle-btn:hover,
.input-password-toggle-btn:active {
  transform: none !important;
  box-shadow: none !important;
}`;
  css = css.substring(0, idx) + replacement + css.substring(closeIdx + 1);
  fs.writeFileSync('src/index.css', css, 'utf8');
  console.log('Successfully updated input-password-toggle-btn');
}
