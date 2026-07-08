FROM node:18-alpine

WORKDIR /app

# Copy frontend package definitions
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend application files
COPY frontend/ .

# Build the frontend Next.js production build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
