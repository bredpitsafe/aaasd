FROM node:20-alpine3.18 AS base

FROM base AS builder
WORKDIR /app

# Copy installation files from root
COPY package.json package-lock.json ./
# Custom patches to apply on npm postinstall
COPY patches ./patches
COPY packages/backend/user-settings/package.json ./packages/backend/user-settings/

# Install dependencies & link local packages in monorepo
ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci --no-audit

# Copy everything from the base repo
COPY . .

# Build app
WORKDIR packages/backend/user-settings
ENV NODE_ENV production
RUN npm run prisma:generate
RUN npm run build

# Generate custom package.json & package-lock.json with NX tooling
RUN node /app/bin/createPackageJson.js @backend/user-settings

# Run app in a separate container
FROM base AS runner
WORKDIR /app

# Copy prebuilt app from builder
COPY --from=builder /app/dist/@backend/user-settings/ ./
COPY --from=builder /app/packages/backend/user-settings/prisma/schema.prisma ./prisma/
# Install dependencies
RUN npm ci
RUN npx prisma generate
# Help Prisma find engine library
ENV PRISMA_QUERY_ENGINE_LIBRARY "/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node"

# Launch the app
ENV NODE_ENV production
EXPOSE 9090 9110
CMD ["node", "index.js"]
