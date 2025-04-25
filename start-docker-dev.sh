#!/bin/bash

# Скрипт для запуска стоматологической клиники через Docker в режиме разработки

# Определяем цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================${NC}"
echo -e "${GREEN}    ЗАПУСК СТОМАТОЛОГИЧЕСКОЙ КЛИНИКИ В РЕЖИМЕ DEV    ${NC}"
echo -e "${BLUE}=====================================================${NC}"
echo ""

# Проверяем, установлен ли Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен!${NC}"
    echo -e "${YELLOW}Пожалуйста, установите Docker с сайта https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Проверяем, установлен ли Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose не установлен!${NC}"
    echo -e "${YELLOW}Пожалуйста, установите Docker Compose с сайта https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

echo -e "${GREEN}Запуск контейнеров Docker в режиме разработки...${NC}"
docker-compose -f docker-compose.dev.yml up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}Стоматологическая клиника успешно запущена в режиме разработки!${NC}"
    echo -e "${BLUE}----------------------------------------------------------${NC}"
    echo -e "${YELLOW}Фронтенд доступен по адресу:${NC} http://localhost:3000"
    echo -e "${YELLOW}Бэкенд API доступен по адресу:${NC} http://localhost:5000/api"
    echo ""
    echo -e "${BLUE}Для просмотра логов контейнеров введите:${NC}"
    echo -e "${YELLOW}docker-compose -f docker-compose.dev.yml logs -f${NC}"
    echo ""
    echo -e "${BLUE}Для завершения работы введите команду:${NC}"
    echo -e "${YELLOW}docker-compose -f docker-compose.dev.yml down${NC}"
else
    echo ""
    echo -e "${RED}Ошибка при запуске контейнеров Docker!${NC}"
    echo -e "${YELLOW}Проверьте логи Docker для получения дополнительной информации:${NC}"
    echo -e "${YELLOW}docker-compose -f docker-compose.dev.yml logs${NC}"
fi 