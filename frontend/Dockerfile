FROM node:22.12.0

WORKDIR /app

# Copy only package.json first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Install Vite globally (not strictly needed, but fine)
RUN npm install -g vite

# Copy the rest of the app
COPY . .

# If you don’t already have Tailwind setup, run this once.
# Better: create tailwind.config.js & postcss.config.js manually, not here.
# RUN npx tailwindcss init -p  

# Fix file permissions
RUN chmod -R 755 /app

EXPOSE 5173

# Default command: start dev server
CMD ["npm", "run", "dev"]
