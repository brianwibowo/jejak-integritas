FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the rest of the application files
COPY . .

# Expose the default backend port
EXPOSE 5001

# Command to run the application
CMD ["node", "index.js"]
