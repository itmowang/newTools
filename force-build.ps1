Write-Host "========================================"
Write-Host "Force Clean and Build"
Write-Host "========================================"
Write-Host ""

Write-Host "[1/5] Stopping all related processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*Toolbox*" -or $_.ProcessName -eq "electron"} | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Processes stopped" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Waiting for file handles to release..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "Wait complete" -ForegroundColor Green
Write-Host ""

Write-Host "[3/5] Force deleting release directory..." -ForegroundColor Yellow
$releasePath = "apps\desktop\release"
if (Test-Path $releasePath) {
    try {
        Remove-Item -Path $releasePath -Recurse -Force -ErrorAction Stop
        Write-Host "Release directory deleted" -ForegroundColor Green
    }
    catch {
        Write-Host "Warning: Cannot delete some files, trying to rename..." -ForegroundColor Yellow
        $backupPath = "apps\desktop\release_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        try {
            Rename-Item -Path $releasePath -NewName $backupPath -Force -ErrorAction Stop
            Write-Host "Renamed to: $backupPath" -ForegroundColor Green
        }
        catch {
            Write-Host "Error: Cannot handle release directory" -ForegroundColor Red
            Write-Host "Please delete manually or restart computer" -ForegroundColor Red
            exit 1
        }
    }
}
else {
    Write-Host "Release directory does not exist, skipping" -ForegroundColor Green
}
Write-Host ""

Write-Host "[4/5] Compiling code..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Compilation complete" -ForegroundColor Green
Write-Host ""

Write-Host "[5/5] Starting packaging..." -ForegroundColor Yellow
Set-Location apps\desktop
pnpm run dist
$buildResult = $LASTEXITCODE
Set-Location ..\..
Write-Host ""

if ($buildResult -eq 0) {
    Write-Host "========================================"
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Installer location:" -ForegroundColor Cyan
    Write-Host "apps\desktop\release\Toolbox Assistant Setup 1.0.0.exe" -ForegroundColor White
    Write-Host ""
    Write-Host "Portable version:" -ForegroundColor Cyan
    Write-Host "apps\desktop\release\ToolboxAssistant-Portable.exe" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host "========================================"
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host "========================================"
    Write-Host ""
    Write-Host "Please check error messages above" -ForegroundColor Yellow
    exit 1
}
