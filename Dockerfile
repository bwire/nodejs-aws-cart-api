FROM node:16.15.1-alpine
LABEL maintainer="e.barbedwire@gmail.com"
WORKDIR app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
ENTRYPOINT ["node", "dist/main.js"]