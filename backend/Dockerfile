FROM node:18-alpine

# Instalar netcat (nc)
# RUN apk add --no-cache netcat-openbsd
RUN apk add --no-cache netcat-openbsd bash

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

COPY wait-for-it.sh /app/wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

EXPOSE 3001

CMD ["./wait-for-it.sh", "mysql:3306", "--", "npm", "start"]
