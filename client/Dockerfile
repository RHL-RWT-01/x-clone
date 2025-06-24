# Use a lighter base for serving static files
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the app and build it
COPY . .
RUN npm run build

# Install a lightweight static server
RUN npm install -g serve

# Serve the build output from 'dist' directory
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
