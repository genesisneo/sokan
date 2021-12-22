:: This batch file will create a basic scheduled task to run Sokan on startup.
:: Do not forget to update the "C:\PATH\TO\Sokan.exe" before `Run as administrator`

SCHTASKS /CREATE /SC ONSTART /TN "Sokan" /TR "C:\PATH\TO\Sokan.exe" /RL HIGHEST
