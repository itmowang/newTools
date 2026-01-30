@echo off
echo ========================================
echo 强制清理并打包
echo ========================================
echo.

echo [1/4] 结束所有相关进程...
taskkill /F /IM "Toolbox Assistant.exe" /T 2>nul
taskkill /F /IM electron.exe /T 2>nul
echo 进程已清理
echo.

echo [2/4] 等待 3 秒...
timeout /t 3 /nobreak >nul
echo.

echo [3/4] 删除旧的 release 目录...
if exist apps\desktop\release (
    rmdir /s /q apps\desktop\release 2>nul
    if exist apps\desktop\release (
        echo 警告: 无法删除 release 目录，文件可能被占用
        echo 请手动关闭所有 Toolbox Assistant 进程后重试
        pause
        exit /b 1
    )
)
echo release 目录已清理
echo.

echo [4/4] 开始打包...
cd apps\desktop
call pnpm run dist
cd ..\..
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo 打包成功！
    echo ========================================
    echo.
    echo 安装文件位置:
    echo apps\desktop\release\Toolbox Assistant Setup 1.0.0.exe
    echo.
) else (
    echo ========================================
    echo 打包失败！
    echo ========================================
    echo.
    echo 请检查错误信息
    echo.
)

pause
