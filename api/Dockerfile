FROM node:22.23.4-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production && mkdir -p /app/uploads && chown -R node:node /app
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["node", "index.js"]
