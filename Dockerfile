FROM node:20-slim

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install ALL backend dependencies (not just production)
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Build frontend
RUN npm run build

# Copy all source files
WORKDIR /app
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
