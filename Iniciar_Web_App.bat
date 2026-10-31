@echo off
chcp 65001 >nul
title Neblina Stereo 105.5 FM - Servidor Web App

:: Asegurar que el directorio de trabajo sea la carpeta del proyecto
cd /d "%~dp0"

echo ==========================================================
echo   Neblina Stereo 105.5 FM - Servidor de Desarrollo
echo ==========================================================
echo.
echo Iniciando servidor local en http://localhost:3000 ...
echo (No cierres esta ventana mientras uses la Web App)
echo.

:: Agregar Node.js al PATH de esta sesión por si no se ha refrescado
set "PATH=%PATH%;C:\Program Files\nodejs\"

:: Abrir automáticamente el navegador tras 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Ejecutar Vite
call npm run dev -- --host

echo.
echo El servidor se ha detenido.
pause
