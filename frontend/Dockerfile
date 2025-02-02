# Use a lightweight Node.js image to build the React app
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# Use Nginx to serve the React app
FROM nginx:alpine

# Copy build files to Nginx's default directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
