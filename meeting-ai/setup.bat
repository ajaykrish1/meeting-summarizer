@echo off
rem Use default code page to avoid PSReadLine issues with Unicode

echo Setting up Meeting Summarizer ^& Action Tracker
echo =============================================

REM --- Checks ---
python --version >nul 2>&1 || (echo ERROR: Python 3.8+ required & pause & exit /b 1)
node --version   >nul 2>&1 || (echo ERROR: Node.js 18+ required & pause & exit /b 1)

pnpm --version >nul 2>&1
if errorlevel 1 (
  echo pnpm not found. Installing pnpm globally...
  npm.cmd install -g pnpm
)

echo Prerequisites check passed

REM Resolve repo root even if invoked from another directory
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

REM --- Backend setup ---
echo.
echo Setting up Backend...
pushd "%ROOT%\backend"

if not exist venv (
  echo Creating Python virtual environment...
  python -m venv venv
)
call venv\Scripts\activate.bat

echo Installing Python dependencies...
if exist requirements.txt (
  pip install -r requirements.txt
) else (
  REM fallback if you do have a pyproject/setup later
  pip install -e .
)

if not exist .env (
  echo Creating .env from .env.example...
  if exist .env.example (copy /Y .env.example .env >nul) else (echo OPENAI_API_KEY=>>.env)
)

if exist scripts\seed.py (
  echo Seeding database with sample data...
  python scripts\seed.py
)

popd

REM --- Frontend setup ---
echo.
echo Setting up Frontend...
pushd "%ROOT%\frontend"
pnpm install

if not exist .env (
  echo VITE_API_URL=http://localhost:8000> .env
  echo Frontend .env created
)

popd

echo.
echo Setup Complete!
echo ==================
echo Launching servers in separate terminals...

REM --- Launch Backend in a new terminal ---
start "Backend" cmd /k "cd /d \"%ROOT%\backend\" && run.bat"

REM --- Launch Frontend in a new terminal ---
REM Prefer pnpm; fallback to npx vite if pnpm is unavailable in that shell
start "Frontend" cmd /k "cd /d \"%ROOT%\frontend\" && run.bat"

echo.
echo Done. Windows opened:
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:5173
echo.
echo Edit backend\.env to add keys (OPENAI_API_KEY / HF_TOKEN, PROVIDER=openai|hf). Without keys, mock provider is used.
echo.
exit /b 0
