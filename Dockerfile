# ------------------------
# Etapa 1: Build Angular
# ------------------------
FROM node:18 AS build-stage

# Crear carpeta de trabajo
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto de la app
COPY . .

# Ejecutar build de producción
RUN npm run build -- --configuration production

# ------------------------
# Etapa 2: Nginx
# ------------------------
FROM nginx:alpine

# Copiar build generado
COPY --from=build-stage /app/dist /usr/share/nginx/html

# (Opcional) Si tienes rutas internas, usa nginx.conf personalizado
# COPY nginx.conf /etc/nginx/conf.d/default.conf
