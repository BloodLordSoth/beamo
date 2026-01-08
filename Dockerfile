FROM node:22-bullseye AS builder
WORKDIR /app
COPY vite-project/package*.json vite-project/
RUN cd vite-project && npm install
COPY vite-project vite-project
RUN cd vite-project && npm run build

FROM node:22-bullseye
WORKDIR /app
COPY package*.json /
RUN npm install --only=production
COPY --from=builder /app/vite-project/dist ./vite-project/dist
COPY . .
EXPOSE 3334
CMD ["node", "server.js"]