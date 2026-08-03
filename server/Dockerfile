# Stage 1: Build the TypeScript project
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production execution environment
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Create folders for uploads and logs
RUN mkdir -p uploads logs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
