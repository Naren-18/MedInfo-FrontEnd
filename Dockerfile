# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Serve stage ---
FROM nginx:1.27-alpine

# nginx's official entrypoint auto-runs envsubst over every file in
# /etc/nginx/templates/*.template into /etc/nginx/conf.d/, substituting any
# ${VAR} that matches an environment variable — this is how GATEWAY_URL gets
# baked into the reverse-proxy config at container start, not build time.
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

ENV GATEWAY_URL=http://gateway-service:8080

EXPOSE 80
