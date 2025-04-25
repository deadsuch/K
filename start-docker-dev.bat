@echo off
echo =====================================================
echo    ЗАПУСК СТОМАТОЛОГИЧЕСКОЙ КЛИНИКИ В РЕЖИМЕ DEV    
echo =====================================================
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

echo Запуск контейнеров Docker в режиме разработки...
docker-compose -f docker-compose.dev.yml up -d --build

if %ERRORLEVEL% equ 0 (
    echo.
    echo Стоматологическая клиника успешно запущена в режиме разработки!
    echo ----------------------------------------------------------
    echo Фронтенд доступен по адресу: http://localhost:3000
    echo Бэкенд API доступен по адресу: http://localhost:5000/api
    echo.
    echo Для просмотра логов контейнеров введите:
    echo docker-compose -f docker-compose.dev.yml logs -f
    echo.
    echo Для завершения работы введите команду:
    echo docker-compose -f docker-compose.dev.yml down
) else (
    echo.
    echo ОШИБКА при запуске контейнеров Docker!
    echo Проверьте логи Docker для получения дополнительной информации:
    echo docker-compose -f docker-compose.dev.yml logs
)

pause 