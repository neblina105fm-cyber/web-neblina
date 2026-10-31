<#
.SYNOPSIS
    Script de respaldo y sincronización limpia para Neblina Stereo 105.5 FM en Google Drive.
.DESCRIPTION
    Copia los archivos fuente, diseños y recursos a Google Drive excluyendo carpetas pesadas
    temporales como node_modules, .cache, dist, etc.
#>

param(
    [string]$TargetFolder = "",
    [int]$MaxBackups = 6
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Neblina Stereo 105.5 FM - Respaldo Limpio a Google Drive" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Detectar unidad de Google Drive automáticamente si no se especifica
if ([string]::IsNullOrWhiteSpace($TargetFolder)) {
    # Buscar unidades virtuales de Google Drive (comúnmente G:, H:, etc.)
    $driveLetter = (Get-PSDrive -PSProvider FileSystem | Where-Object { 
        (Test-Path "$($_.Root)Mi unidad") -or (Test-Path "$($_.Root)My Drive")
    } | Select-Object -First 1).Root

    if ($driveLetter) {
        $miUnidad = if (Test-Path "$($driveLetter)Mi unidad") { "$($driveLetter)Mi unidad" } else { "$($driveLetter)My Drive" }
        $TargetFolder = Join-Path $miUnidad "Neblina Stereo 105.5 FM - Web App"
    } else {
        # Si no hay letra de unidad montada, buscar ruta estándar de sincronización
        $userDrive = Join-Path $env:USERPROFILE "Google Drive"
        if (Test-Path $userDrive) {
            $TargetFolder = Join-Path $userDrive "Neblina Stereo 105.5 FM - Web App"
        }
    }
}

if ([string]::IsNullOrWhiteSpace($TargetFolder)) {
    Write-Host "[!] No se detecto automaticamente la unidad o carpeta de Google Drive." -ForegroundColor Red
    Write-Host "    Asegurate de que Google Drive for Desktop este abierto e iniciado sesion." -ForegroundColor Yellow
    exit 1
}

Write-Host "[+] Destino en Google Drive: $TargetFolder" -ForegroundColor Green

# 2. Rutas del proyecto
$SourceFolder = Split-Path -Parent $PSScriptRoot
if (-not $SourceFolder -or -not (Test-Path $SourceFolder)) {
    $SourceFolder = Get-Location
}

$DestSource = Join-Path $TargetFolder "Codigo_Fuente"
$DestZip = Join-Path $TargetFolder "Historial_Versiones"

if (-not (Test-Path $DestSource)) { New-Item -ItemType Directory -Path $DestSource -Force | Out-Null }
if (-not (Test-Path $DestZip)) { New-Item -ItemType Directory -Path $DestZip -Force | Out-Null }

# 3. Exclusiones críticas (evita saturar Google Drive con 30.000+ archivos temporales)
$Exclusions = @("node_modules", ".git", ".cache", "dist", "build", ".next", ".temp", ".tmp", "*.log")

Write-Host "[*] Sincronizando archivos fuente limpios..." -ForegroundColor Cyan

# Usar Robocopy para sincronización incremental ultra rápida
$robocopyParams = @(
    $SourceFolder,
    $DestSource,
    "/MIR",                # Espejo (mantiene idéntico el destino)
    "/XD", "node_modules", ".git", ".cache", "dist", "build", ".next", ".temp", ".tmp",
    "/XF", "*.log", "*.lock",
    "/R:1", "/W:1",        # Reintentos rápidos
    "/NFL", "/NDL", "/NJH", "/NJS" # Salida limpia
)

& robocopy.exe @robocopyParams | Out-Null

Write-Host "[OK] Archivos fuente sincronizados exitosamente." -ForegroundColor Green

# 4. Crear snapshot ZIP ligero con fecha/hora
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$zipFileName = "Neblina_WebApp_$timestamp.zip"
$zipPath = Join-Path $DestZip $zipFileName

Write-Host "[*] Generando version comprimida ($zipFileName)..." -ForegroundColor Cyan

# Obtener lista de archivos a comprimir (excluyendo temporales)
$tempZipStaging = Join-Path $env:TEMP "Neblina_Backup_Staging_$timestamp"
if (Test-Path $tempZipStaging) { Remove-Item -Recurse -Force $tempZipStaging }
New-Item -ItemType Directory -Path $tempZipStaging | Out-Null

& robocopy.exe $SourceFolder $tempZipStaging /E /XD node_modules .git .cache dist build .next .temp .tmp /XF *.log /NFL /NDL /NJH /NJS | Out-Null

Compress-Archive -Path "$tempZipStaging\*" -DestinationPath $zipPath -Force
Remove-Item -Recurse -Force $tempZipStaging

Write-Host "[OK] Copia de seguridad guardada en Google Drive:" -ForegroundColor Green
Write-Host "     - Carpeta de trabajo: $DestSource" -ForegroundColor White
Write-Host "     - Respaldo empaquetado: $zipPath" -ForegroundColor White

# 5. Política de retención estricta: Máximo 6 respaldos (eliminar los más antiguos)
Write-Host "[*] Verificando politica de retencion ($MaxBackups respaldos maximo)..." -ForegroundColor Cyan
$allBackups = Get-ChildItem -Path (Join-Path $DestZip "Neblina_WebApp_*.zip") | Sort-Object LastWriteTime -Descending

if ($allBackups.Count -gt $MaxBackups) {
    $backupsToDelete = $allBackups | Select-Object -Skip $MaxBackups
    Write-Host "[*] Se detectaron $($allBackups.Count) respaldos. Eliminando $($backupsToDelete.Count) antiguos..." -ForegroundColor Yellow
    foreach ($oldBackup in $backupsToDelete) {
        try {
            Remove-Item -LiteralPath $oldBackup.FullName -Force -ErrorAction Stop
            Write-Host "    [-] Eliminado respaldo antiguo: $($oldBackup.Name)" -ForegroundColor DarkGray
        } catch {
            Write-Host "    [!] Advertencia: No se pudo eliminar $($oldBackup.Name): $_" -ForegroundColor Red
        }
    }
}

$remainingBackups = Get-ChildItem -Path (Join-Path $DestZip "Neblina_WebApp_*.zip") | Sort-Object LastWriteTime -Descending
Write-Host "[OK] Politica de retencion activa. Respaldos conservados en Google Drive ($($remainingBackups.Count)/$MaxBackups):" -ForegroundColor Green
foreach ($item in $remainingBackups) {
    $sizeMB = [math]::Round($item.Length / 1MB, 2)
    Write-Host "     * $($item.Name) ($sizeMB MB - $($item.LastWriteTime.ToString('yyyy-MM-dd HH:mm')))" -ForegroundColor Gray
}

Write-Host "==========================================================" -ForegroundColor Cyan
