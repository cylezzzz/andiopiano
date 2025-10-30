@echo off
setlocal enabledelayedexpansion
REM === Immer in den Ordner der BAT wechseln ===
pushd "%~dp0"

echo.
echo === ANDIO PIANO - glossy start (Expo) ===
echo Projektpfad: %CD%
echo.

REM --- 1) NPM-Projekt sicherstellen ---
if not exist package.json (
  echo [INIT] package.json fehlt -> npm init -y
  call npm init -y
)

REM --- 2) Expo-Stack sicherstellen ---
REM pruefen, ob expo installiert ist
call npm ls expo >nul 2>&1
if errorlevel 1 (
  echo [INSTALL] expo, react, react-native werden installiert...
  call npm install expo@54 react react-native
) else (
  echo [OK] expo ist vorhanden.
)

REM --- 3) Typen/Babel (idempotent) ---
call npm ls babel-preset-expo >nul 2>&1 || call npm install -D babel-preset-expo
call npm ls typescript >nul 2>&1 || call npm install -D typescript @types/react @types/react-native

REM babel.config.js minimal anlegen, falls fehlt
if not exist babel.config.js (
  >babel.config.js echo module.exports = function(api){api.cache(true);return {presets:['babel-preset-expo']};};
)

REM --- 4) UI-Abhaengigkeiten (Gradient, Safe Area) ---
echo [INSTALL] expo-linear-gradient + react-native-safe-area-context
call npx --yes expo install expo-linear-gradient react-native-safe-area-context

echo.
echo [START] Expo mit Cache-Reset...
call npx expo start -c

popd
endlocal
