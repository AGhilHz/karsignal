Set-Location "E:\site-jadide-man"
Write-Host "Cleaning npm cache..."
npm cache clean --force
Write-Host "Installing dependencies..."
npm install --legacy-peer-deps
Write-Host "INSTALL COMPLETE"
