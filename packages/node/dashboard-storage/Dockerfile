FROM node:20-alpine3.18 AS base

FROM base AS builder
WORKDIR /app

# Copy installation files from root
COPY package.json package-lock.json ./
COPY packages/node/dashboard-storage/package.json ./packages/node/dashboard-storage/

# Install dependencies & link local packages in monorepo
ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci --no-audit

# Copy everything from the base repo
COPY . .

# Build app
WORKDIR packages/node/dashboard-storage
ENV NODE_ENV production
RUN npm run build

# Run app in a separate container
FROM base AS runner
WORKDIR /app

# Copy prebuilt app from builder
COPY --from=builder /app/dist/@bhft/dashboard-storage/ ./
# Install dependencies
RUN npm ci

# Launch the app
ENV NODE_ENV production
EXPOSE 8100
CMD ["node", "index.js"]
