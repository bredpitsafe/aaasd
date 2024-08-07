FROM node:20-alpine3.18 AS base

FROM base AS builder
WORKDIR /app

# Copy installation files from root
COPY package.json package-lock.json ./
# Custom patches to apply on npm postinstall
COPY patches ./patches
COPY packages/backend/bff/package.json ./packages/backend/bff/

# Install dependencies & link local packages in monorepo
ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci --no-audit

# Copy everything from the base repo
COPY . .

# Build app
WORKDIR packages/backend/bff
ENV NODE_ENV production
RUN npm run build

# Generate custom package.json & package-lock.json with NX tooling
RUN node /app/bin/createPackageJson.js @backend/bff

# Run app in a separate container
FROM base AS runner
WORKDIR /app

# Copy prebuilt app from builder
COPY --from=builder /app/dist/@backend/bff/ ./
# Install dependencies
RUN npm ci

# Launch the app
ENV NODE_ENV production

EXPOSE 8100
CMD ["node", "index.js"]
