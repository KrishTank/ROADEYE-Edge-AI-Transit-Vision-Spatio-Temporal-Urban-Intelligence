@echo off
setlocal
title UrbanSense AI

cd /d "%~dp0.."

echo.
echo ============================================================
echo   URBANSENSE AI - STARTING
echo ============================================================
echo.

where python >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python is not installed or not in PATH.
  pause
  exit /b 1
)

if not exist "backend\venv\Scripts\python.exe" (
  echo [1/4] Creating Python virtual environment...
  python -m venv backend\venv
  if errorlevel 1 (
    echo [ERROR] Could not create virtual environment.
    pause
    exit /b 1
  )
)

echo [2/4] Installing/checking backend dependencies...
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 (
  echo [ERROR] Dependency installation failed.
  pause
  exit /b 1
)

if not exist "backend\urbansense.db" (
  echo [3/4] Creating demo database...
  cd /d "%~dp0..\backend"
  backend\venv\Scripts\python.exe seed.py
  cd /d "%~dp0.."
) else (
  echo [3/4] Existing database found.
)

echo [4/4] Starting backend and frontend...
start "UrbanSense Backend" cmd /k "cd /d ""%~dp0..\backend"" && venv\Scripts\python.exe app.py"
start "UrbanSense Frontend" cmd /k "cd /d ""%~dp0..\frontend"" && python -m http.server 5500"

timeout /t 4 /nobreak >nul
start "" "http://localhost:5500/index.html"

echo.
echo ============================================================
echo   Frontend: http://localhost:5500
echo   Backend:  http://localhost:5000
echo ============================================================
echo.
echo Close the two server windows when finished.
pause
