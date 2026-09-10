FROM node:20-alpine AS builder

# Install build tools for C++
RUN apk add --no-cache g++ make

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Compile C++ backend for Linux architecture
RUN cd backend && g++ -O3 -std=c++11 -Iinclude main.cpp -o pos_backend

# Build Next.js
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Ensure we have the necessary runtime libs for C++ if any (usually built statically but safe to have libstdc++)
RUN apk add --no-cache libstdc++

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/pos_backend ./backend/pos_backend
COPY --from=builder /app/schema.sql ./schema.sql
COPY --from=builder /app/pos.db ./pos.db
COPY --from=builder /app/init-db.js ./init-db.js

# Create data directory for persistent SQLite storage
RUN mkdir -p /data
ENV DB_PATH=./pos.db

EXPOSE 3000
CMD ["sh", "-c", "node init-db.js && npm start"]
