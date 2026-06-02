FROM node:20-slim

WORKDIR /app

# Copy all files first
COPY . .

# Install backend dependencies
RUN npm install --production

# Install frontend dependencies and build
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Go back to app root
WORKDIR /app

EXPOSE 5000

CMD ["node", "server.js"]
