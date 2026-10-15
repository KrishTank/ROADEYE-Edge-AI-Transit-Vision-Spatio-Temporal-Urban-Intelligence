@echo off
setlocal
title ROADEYE - Stop
echo Stopping ROADEYE servers...
taskkill /FI "WINDOWTITLE eq ROADEYE Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq ROADEYE Frontend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq UrbanSense Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq UrbanSense Frontend*" /T /F >nul 2>&1
echo ROADEYE servers stopped.
pause
