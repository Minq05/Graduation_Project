@echo off
echo Updating subtrees...

echo.
echo Updating client...
git subtree pull --prefix=client https://github.com/thenam2kx/Graduation_Project-client.git main

echo.
echo Updating admin...
git subtree pull --prefix=admin https://github.com/thenam2kx/Graduation_Project-admin.git main

echo.
echo Updating backend...
git subtree pull --prefix=backend https://github.com/thenam2kx/Graduation_Project-APIs.git main

echo.
echo All subtrees updated successfully!
pause