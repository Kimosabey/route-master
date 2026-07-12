# Node 22 runs the TypeScript sources directly via type-stripping — no build step.
FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
ENV PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "src/server.ts"]
