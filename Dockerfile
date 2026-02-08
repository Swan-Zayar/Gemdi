# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Create production env file with only public Firebase config
RUN echo "VITE_FIREBASE_API_KEY=AIzaSyADqX1jtUsZ8cqAHANHo8ybXIpZ4aK3y1w" > .env.production && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=gemdi-9509b.firebaseapp.com" >> .env.production && \
    echo "VITE_FIREBASE_PROJECT_ID=gemdi-9509b" >> .env.production && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=gemdi-9509b.firebasestorage.app" >> .env.production && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=64960042898" >> .env.production && \
    echo "VITE_FIREBASE_APP_ID=1:64960042898:web:408141714d2ebdaa54934b" >> .env.production

RUN npm run build

# Runtime stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l $PORT"]
