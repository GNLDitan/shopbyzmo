param([string]$env, [string]$websitefoldername)

Remove-Item "C:\webapps\$websitefoldername" -Recurse -Force

Copy-Item ".\dist\byzmo-web" -Destination "C:\webapps\$websitefoldername" -Recurse -Force

Copy-Item ".\dist\server" -Destination "C:\webapps\$websitefoldername" -Recurse -Force

Copy-Item ".\dist\server.js" -Destination "C:\webapps\$websitefoldername" -Recurse -Force

Copy-Item "C:\properties\byzmo\$env\web.config" -Destination "C:\webapps\$websitefoldername"

Copy-Item "C:\properties\byzmo\$env\environments\web.config" -Destination "C:\webapps\$websitefoldername\byzmo-web"
