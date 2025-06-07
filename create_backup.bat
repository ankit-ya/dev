@echo off
echo Creating daily backup of your project...
set BACKUP_DATE=%date:~10,4%%date:~4,2%%date:~7,2%

echo Creating dev backup...
powershell -Command "Compress-Archive -Path 'dev' -DestinationPath 'backup/dev_backup_%BACKUP_DATE%.zip' -Force"

echo Creating frontend backup...
powershell -Command "Compress-Archive -Path 'frontend' -DestinationPath 'backup/frontend_backup_%BACKUP_DATE%.zip' -Force"

echo Backup completed! Files are saved in the backup folder.
echo Dev backup: backup/dev_backup_%BACKUP_DATE%.zip
echo Frontend backup: backup/frontend_backup_%BACKUP_DATE%.zip
pause 