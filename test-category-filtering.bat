@echo off
echo Testing service requests filtering...

echo.
echo Current system:
echo - Requests are filtered by location AND category
echo - Only matching business category will see relevant requests
echo - No more irrelevant requests (e.g., car service to hair salon)

echo.
echo Filter priority:
echo 1. Same subcategory (most specific)  
echo 2. Same main category (if no subcategory specified)
echo 3. No category specified (general requests)
echo + Same province location

echo.
echo Test by creating different service requests and checking dashboard

pause
