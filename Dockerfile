FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install backend dependencies
RUN npm install --production

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy backend files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
