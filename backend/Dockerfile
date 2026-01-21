FROM node:20-alpine

WORKDIR /app

# Install dependencies (backend)
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy source (backend)
COPY backend/server.js ./server.js

EXPOSE 3000
CMD ["node", "server.js"]
