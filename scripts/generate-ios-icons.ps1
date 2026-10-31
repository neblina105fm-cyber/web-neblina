# Neblina Stereo 105.5 FM - Generador de Iconos estilo iOS y PWA
# Produce iconos con esquinas redondeadas (squircle continuo Apple), resplandor ambiental y fondo de cristal oscuro.

Add-Type -AssemblyName System.Drawing

function Create-IosAppIcon {
    param(
        [int]$Size,
        [string]$OutputPath,
        [bool]$IsMaskable = $false,
        [string]$SourceIconPath = 'public\icon.png'
    )

    if (-not (Test-Path $SourceIconPath)) {
        Write-Error "No se encontro el icono fuente en $SourceIconPath"
        return
    }

    $srcBmp = [System.Drawing.Bitmap]::FromFile($SourceIconPath)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    # Margen exterior y radio de squircle estilo Apple iOS (~22.5%)
    $margin = if ($IsMaskable) { 0.0 } else { [Math]::Max(1.0, [double]($Size * 0.02)) }
    $rectW = [double]($Size - (2.0 * $margin))
    $rectH = [double]($Size - (2.0 * $margin))
    $rect = New-Object System.Drawing.RectangleF([float]$margin, [float]$margin, [float]$rectW, [float]$rectH)
    $radius = if ($IsMaskable) { 0.0 } else { [double]($rectW * 0.225) }

    # Crear Path del Squircle iOS
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($IsMaskable) {
        $path.AddRectangle($rect)
    } else {
        $d = [float]($radius * 2.0)
        $path.AddArc($rect.X, $rect.Y, $d, $d, 180.0, 90.0)
        $path.AddArc(($rect.Right - $d), $rect.Y, $d, $d, 270.0, 90.0)
        $path.AddArc(($rect.Right - $d), ($rect.Bottom - $d), $d, $d, 0.0, 90.0)
        $path.AddArc($rect.X, ($rect.Bottom - $d), $d, $d, 90.0, 90.0)
        $path.CloseFigure()
    }

    $g.SetClip($path)

    # 1. Fondo de Cristal Oscuro Apple (Deep Midnight a Royal Navy)
    $cTop = [System.Drawing.Color]::FromArgb(255, 6, 20, 30)      # #06141e
    $cMid = [System.Drawing.Color]::FromArgb(255, 7, 28, 40)      # #071c28
    $cBot = [System.Drawing.Color]::FromArgb(255, 9, 10, 61)      # #090A3D (Navy oficial)
    
    $pt1 = New-Object System.Drawing.PointF(0.0, 0.0)
    $pt2 = New-Object System.Drawing.PointF([float]$Size, [float]$Size)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($pt1, $pt2, $cTop, $cBot)
    
    $blend = New-Object System.Drawing.Drawing2D.ColorBlend
    $blend.Colors = @($cTop, $cMid, $cBot)
    $blend.Positions = @([float]0.0, [float]0.45, [float]1.0)
    $bgBrush.InterpolationColors = $blend
    $g.FillRectangle($bgBrush, 0, 0, $Size, $Size)
    $bgBrush.Dispose()

    # 2. Resplandor Ambiental Radial Cyan (#21F8D2)
    $glowW = [float]($Size * 1.3)
    $glowH = [float]($Size * 1.3)
    $glowX = [float](-($Size * 0.15))
    $glowY = [float](-($Size * 0.15))
    $glowRect = New-Object System.Drawing.RectangleF($glowX, $glowY, $glowW, $glowH)
    $glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $glowPath.AddEllipse($glowRect)
    $glowBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
    $glowBrush.CenterColor = [System.Drawing.Color]::FromArgb(85, 33, 248, 210) # #21F8D2 al 33%
    $glowBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 33, 248, 210))
    $g.FillPath($glowBrush, $glowPath)
    $glowBrush.Dispose()
    $glowPath.Dispose()

    # 3. Resplandor de Acento Oro (#FEDC01) en esquina inferior derecha
    $goldW = [float]($Size * 0.9)
    $goldH = [float]($Size * 0.9)
    $goldX = [float]($Size * 0.4)
    $goldY = [float]($Size * 0.4)
    $goldRect = New-Object System.Drawing.RectangleF($goldX, $goldY, $goldW, $goldH)
    $goldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $goldPath.AddEllipse($goldRect)
    $goldBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($goldPath)
    $goldBrush.CenterColor = [System.Drawing.Color]::FromArgb(38, 254, 220, 1) # #FEDC01 al 15%
    $goldBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 254, 220, 1))
    $g.FillPath($goldBrush, $goldPath)
    $goldBrush.Dispose()
    $goldPath.Dispose()

    # 4. Dibujar el Isotipo Oficial de la Radio con Proporción Óptica Apple
    # Dimensiones originales de icon.png: 544 x 444 (ratio 1.225)
    $targetRatio = if ($IsMaskable) { 0.60 } else { 0.74 }
    $logoW = [Math]::Max(4, [int]($Size * $targetRatio))
    $logoH = [Math]::Max(4, [int]($logoW / (544.0 / 444.0)))
    $logoX = [int](($Size - $logoW) / 2)
    $logoY = [int](($Size - $logoH) / 2)

    # Sombra suave sutil bajo el logo
    $shadowOffset = [Math]::Max(1, [int]($Size * 0.015))
    $ia = New-Object System.Drawing.Imaging.ImageAttributes
    $cm = New-Object System.Drawing.Imaging.ColorMatrix
    $cm.Matrix33 = 0.35 # 35% opacidad
    $ia.SetColorMatrix($cm)
    $dstShadowRect = New-Object System.Drawing.Rectangle($logoX, ($logoY + $shadowOffset), $logoW, $logoH)
    $g.DrawImage($srcBmp, $dstShadowRect, 0, 0, [int]$srcBmp.Width, [int]$srcBmp.Height, [System.Drawing.GraphicsUnit]::Pixel, $ia)
    $ia.Dispose()

    # Logo nítido en el centro óptico
    $dstLogoRect = New-Object System.Drawing.Rectangle($logoX, $logoY, $logoW, $logoH)
    $g.DrawImage($srcBmp, $dstLogoRect, 0, 0, [int]$srcBmp.Width, [int]$srcBmp.Height, [System.Drawing.GraphicsUnit]::Pixel)

    # 5. Borde Especular Biselado estilo Cristal iOS
    if (-not $IsMaskable) {
        $g.ResetClip()
        $penWidth = [Math]::Max(1.0, [double]($Size * 0.012))
        $penPt1 = New-Object System.Drawing.PointF($rect.X, $rect.Y)
        $penPt2 = New-Object System.Drawing.PointF($rect.X, $rect.Bottom)
        $penBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
            $penPt1,
            $penPt2,
            [System.Drawing.Color]::FromArgb(150, 255, 255, 255),
            [System.Drawing.Color]::FromArgb(35, 33, 248, 210)
        )
        $borderPen = New-Object System.Drawing.Pen($penBrush, [float]$penWidth)
        $g.DrawPath($borderPen, $path)
        $borderPen.Dispose()
        $penBrush.Dispose()
    }

    $path.Dispose()
    $g.Dispose()
    $srcBmp.Dispose()

    # Guardar imagen optimizada
    $dir = [System.IO.Path]::GetDirectoryName($OutputPath)
    if (-not [string]::IsNullOrEmpty($dir) -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host ('[OK] Generated: ' + $OutputPath + ' (' + $Size + 'x' + $Size + ')')
}

# 1. Generar la suite para Apple iOS (Safari PWA & Home Screen)
Create-IosAppIcon -Size 180 -OutputPath 'public\apple-touch-icon.png'
Create-IosAppIcon -Size 180 -OutputPath 'public\apple-touch-icon-180x180.png'
Create-IosAppIcon -Size 152 -OutputPath 'public\apple-touch-icon-152x152.png'
Create-IosAppIcon -Size 120 -OutputPath 'public\apple-touch-icon-120x120.png'

# 2. Generar iconos PWA para Computadora y Android (Standard Squircle "any")
Create-IosAppIcon -Size 512 -OutputPath 'public\icon-512.png'
Create-IosAppIcon -Size 192 -OutputPath 'public\icon-192.png'

# 3. Generar iconos PWA Maskable (Full Bleed con safe zone para Android)
Create-IosAppIcon -Size 512 -OutputPath 'public\icon-maskable-512.png' -IsMaskable $true
Create-IosAppIcon -Size 192 -OutputPath 'public\icon-maskable-192.png' -IsMaskable $true

# 4. Generar iconos de Pestaña de Navegador (Favicons en múltiples resoluciones)
Create-IosAppIcon -Size 64  -OutputPath 'public\favicon.png'
Create-IosAppIcon -Size 48  -OutputPath 'public\favicon-48x48.png'
Create-IosAppIcon -Size 32  -OutputPath 'public\favicon-32x32.png'
Create-IosAppIcon -Size 16  -OutputPath 'public\favicon-16x16.png'

# Copiar a src/assets para consistencia de bundling
Copy-Item 'public\apple-touch-icon.png' 'src\assets\apple-touch-icon.png' -Force
Copy-Item 'public\icon-192.png' 'src\assets\icon-192.png' -Force
Copy-Item 'public\icon-512.png' 'src\assets\icon-512.png' -Force

Write-Host "Todas las versiones de iconos estilo iOS fueron generadas con éxito."
