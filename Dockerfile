FROM node:20-slim

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies (both backend and frontend)
RUN npm install
RUN cd frontend && npm install && npm run build

EXPOSE 5000

CMD ["node", "server.js"]
