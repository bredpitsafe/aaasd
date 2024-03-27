FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY ./patches ./patches
RUN npm ci

COPY tsconfig.json ./
COPY ./config ./config
COPY ./data ./data
COPY ./src ./src

EXPOSE 8101
CMD ["npm", "start"]
