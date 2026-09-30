@echo off
setlocal
title UrbanSense AI - Stop
echo Stopping UrbanSense servers...
taskkill /FI "WINDOWTITLE eq UrbanSense Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq UrbanSense Frontend*" /T /F >nul 2>&1
echo UrbanSense servers stopped.
pause
