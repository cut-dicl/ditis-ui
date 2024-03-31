@ECHO OFF
npm i
npm install pm2 -g
ECHO Dependencies have been installed, proceed with configuration...
REM Open .env file
start "" ".env"
pause