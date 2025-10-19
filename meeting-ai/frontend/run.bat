@echo off
cd /d "%~dp0"
pnpm -v >nul 2>&1
if %errorlevel%==0 (
  pnpm dev
) else (
  npx vite --port 5173 --host 0.0.0.0
)

