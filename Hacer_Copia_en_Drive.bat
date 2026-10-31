@echo off
chcp 65001 >nul
title Neblina Stereo 105.5 FM - Sincronizar con Google Drive
echo Iniciando sincronizacion limpia hacia Google Drive...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\backup-drive.ps1"
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
