FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта
COPY . .

# Создаем директорию для загрузки файлов
RUN mkdir -p /app/uploads/doctors

# Открываем порт
EXPOSE 5000

# Запускаем сервер
CMD ["npm", "start"] 