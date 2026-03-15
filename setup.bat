@echo off
echo Installing dependencies...
call npm install
echo.
echo Copying Baby Nepo.mp3 from Downloads to public folder...
copy "%USERPROFILE%\Downloads\Baby Nepo.mp3" "public\Baby Nepo.mp3" 2>nul
if errorlevel 1 (
    echo NOTE: Baby Nepo.mp3 not found in Downloads. You can add it to the public folder later.
) else (
    echo Audio file copied successfully!
)
echo.
echo Starting Remotion Studio...
npx remotion studio src/index.ts
