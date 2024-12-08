# Etapa 1: Build da aplicação Angular
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm install -g @angular/cli
EXPOSE 4200
CMD [ "ng", "serve", "--host", "0.0.0.0" ]

