# SoulMatch Android Icon Generator
# Uses .NET System.Drawing to resize icon to all required mipmap sizes

param(
    [string]$SourceImage = "C:\Users\91638\.gemini\antigravity-ide\brain\76c469b5-adbe-495d-939c-e01e8fdfcb5c\soulmatch_icon_source_1784610695415.png",
    [string]$ResDir = "C:\Users\91638\Desktop\SoulMatch App\Soul-Match-AI\artifacts\soulmatch\android\app\src\main\res"
)

Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )
    
    $src = [System.Drawing.Image]::FromFile($InputPath)
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($src, 0, 0, $Width, $Height)
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "  Created: $OutputPath ($Width x $Height)"
}

function Create-RoundIcon {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Size
    )
    
    $src = [System.Drawing.Image]::FromFile($InputPath)
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Clear with transparent
    $graphics.Clear([System.Drawing.Color]::Transparent)
    
    # Create circular clip path
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $Size, $Size)
    $graphics.SetClip($path)
    
    # Draw the image
    $graphics.DrawImage($src, 0, 0, $Size, $Size)
    
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "  Created round: $OutputPath ($Size x $Size)"
}

# Android mipmap sizes: folder -> (launcher_size, foreground_size)
$sizes = @{
    "mipmap-mdpi"    = @{ launcher = 48;  foreground = 108 }
    "mipmap-hdpi"    = @{ launcher = 72;  foreground = 162 }
    "mipmap-xhdpi"   = @{ launcher = 96;  foreground = 216 }
    "mipmap-xxhdpi"  = @{ launcher = 144; foreground = 324 }
    "mipmap-xxxhdpi" = @{ launcher = 192; foreground = 432 }
}

Write-Host "Generating SoulMatch icons from: $SourceImage"
Write-Host "Output directory: $ResDir"
Write-Host ""

foreach ($folder in $sizes.Keys) {
    $outDir = Join-Path $ResDir $folder
    $launcherSize = $sizes[$folder].launcher
    $fgSize = $sizes[$folder].foreground
    
    Write-Host "[$folder]"
    
    # ic_launcher.png
    Resize-Image -InputPath $SourceImage -OutputPath (Join-Path $outDir "ic_launcher.png") -Width $launcherSize -Height $launcherSize
    
    # ic_launcher_round.png (circular)
    Create-RoundIcon -InputPath $SourceImage -OutputPath (Join-Path $outDir "ic_launcher_round.png") -Size $launcherSize
    
    # ic_launcher_foreground.png (larger, for adaptive icons)
    Resize-Image -InputPath $SourceImage -OutputPath (Join-Path $outDir "ic_launcher_foreground.png") -Width $fgSize -Height $fgSize
    
    Write-Host ""
}

Write-Host "Done! All icons generated successfully."
Write-Host "Now rebuild the APK with: cd artifacts\soulmatch && npx cap sync android && cd android && .\gradlew assembleDebug"
