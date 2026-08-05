@echo off
echo Running Git commands to push to GitHub...

cd c:\UMTECH

echo "# umtechsoluion" >> README.md
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/uwiringiyimanamoise299-bit/umtechsoluion.git
git push -u origin main

echo.
echo =======================================================
echo If you saw an error that 'remote origin already exists',
echo don't worry! The script will now try to push anyway.
echo =======================================================
echo.

git push -u origin main

echo.
pause
