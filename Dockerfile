FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install ALL backend dependencies (including dotenv)
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build frontend
RUN npm run build

# Copy source code
WORKDIR /app
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
