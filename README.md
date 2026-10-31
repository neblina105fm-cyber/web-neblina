# Neblina Stereo 105.5 FM - Web App

Proyecto de desarrollo para la nueva Web App / PWA oficial de la estación de radio **Neblina Stereo 105.5 FM** (`neblina105fm.com`).

---

## ☁️ Sincronización y Respaldo en Google Drive

Para evitar que Google Drive se congele con miles de archivos temporales (como `node_modules` en aplicaciones web modernas), hemos preparado un sistema de sincronización limpia:

1. **Ubicación en Google Drive:**
   - Detecta automáticamente la unidad de Google Drive asignada (`G:\Mi unidad` o similar).
   - Crea una carpeta organizada: `Neblina Stereo 105.5 FM - Web App`.

2. **Estructura en la nube:**
   - `Codigo_Fuente/`: Copia espejo en tiempo real de todos los archivos de diseño, código, estilos y recursos esenciales.
   - `Historial_Versiones/`: Archivos comprimidos `.zip` fechados (ej. `Neblina_WebApp_2026-10-21.zip`), ideales para restaurar versiones estables si ocurre algún error.

3. **Ejecución rápida:**
   - Haz doble clic en [`Hacer_Copia_en_Drive.bat`](file:///d:/Proyectos%20IA/Neblina%20Stereo/Web%20App%20-%20Neblina%20105.5%20Fm/Hacer_Copia_en_Drive.bat) o ejecútalo mediante la consola.
