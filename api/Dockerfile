# Dockerfile

FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install

COPY src ./src/
COPY fe ./fe/

EXPOSE 3000
EXPOSE 8081

CMD ["node", "src/index.js"]