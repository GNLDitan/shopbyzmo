param([string]$env, [string]$websitefoldername)

Copy-Item "C:\properties\byzmo\$env\appsettings.json" -Destination "C:\webapps\$websitefoldername" -Force

Copy-Item "C:\properties\byzmo\$env\appsettings.json" -Destination ".\" -Force

Copy-Item "C:\properties\byzmo\$env\images" -Destination "C:\webapps\$websitefoldername\file\images" -Recurse -Force

Copy-Item ".\Templates" -Destination "C:\webapps\$websitefoldername" -Recurse -Force
