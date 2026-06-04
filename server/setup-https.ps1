Write-Host "Generating certificate..."
npm run gen-cert

Write-Host "Trusting certificate..."
Import-Certificate -FilePath "cert.pem" -CertStoreLocation Cert:\CurrentUser\Root

Write-Host "Copying frontend .env.example to .env..."
Copy-Item "..\my-app\.env.example" "..\my-app\.env"

Write-Host "Installing server dependencies..."
npm install

Write-Host "Installing frontend dependencies..."
Push-Location "..\my-app"
npm install
Pop-Location

Write-Host ""
Write-Host "Setup complete. Remember to restart Chrome/Edge before running the app."
Write-Host "To start the app, run 'npm start' in both the server and my-app folders."