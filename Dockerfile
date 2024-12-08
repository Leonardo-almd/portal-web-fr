# Etapa 1: Build da aplicação Angular
FROM node:18 AS build

WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Compila a aplicação em modo de produção
RUN npm run build

# Etapa 2: Servir com NGINX
FROM nginx:alpine

# Copia os arquivos compilados para o diretório padrão do NGINX
COPY --from=build /app/dist/<nome-do-seu-projeto> /usr/share/nginx/html

# Expondo a porta padrão do NGINX
EXPOSE 80

# Comando padrão para rodar o NGINX
CMD ["nginx", "-g", "daemon off;"]
