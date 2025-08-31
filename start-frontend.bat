@echo off
echo Starting Frontend Application...

REM Navigate to frontend directory
cd frontend

REM Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the development server
echo Starting development server...
npm start

pause
