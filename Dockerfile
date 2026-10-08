FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/engine/package.json packages/engine/package.json
COPY packages/api-client/package.json packages/api-client/package.json
RUN npm ci --omit=dev
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/server ./apps/server
ENV NODE_ENV=production
EXPOSE 4000
CMD ["npm", "run", "start", "--workspace", "@republic/server"]
