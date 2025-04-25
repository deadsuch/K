@echo off
echo ================================================
echo    ЗАПУСК СТОМАТОЛОГИЧЕСКОЙ КЛИНИКИ В DOCKER    
echo ================================================
echo.

REM Проверяем, установлен ли Docker
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ОШИБКА: Docker не установлен!
    echo Пожалуйста, установите Docker с сайта https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

REM Проверяем, установлен ли Docker Compose
where docker-compose >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ОШИБКА: Docker Compose не установлен!
    echo Пожалуйста, установите Docker Compose с сайта https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo Запуск контейнеров Docker...
docker-compose -f docker-compose.yml up -d --build

if %ERRORLEVEL% equ 0 (
    echo.
    echo Стоматологическая клиника успешно запущена!
    echo ------------------------------------------
    echo Фронтенд доступен по адресу: http://localhost
    echo Бэкенд API доступен по адресу: http://localhost/api
    echo.
    echo Для завершения работы введите команду:
    echo docker-compose -f docker-compose.yml down
) else (
    echo.
    echo ОШИБКА при запуске контейнеров Docker!
    echo Проверьте логи Docker для получения дополнительной информации:
    echo docker-compose -f docker-compose.yml logs
)

pause 