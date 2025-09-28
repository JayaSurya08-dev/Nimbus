# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port (default Vite port is 5173)
EXPOSE 5173

# Start the dev server
CMD ["npm", "run", "dev", "--", "--host"]
