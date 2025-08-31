FROM node:22.12.0

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Install Vite globally to avoid permission issues
RUN npm install -g vite

COPY . .

# Ensure all files are readable and executable
RUN chmod -R 755 /app

EXPOSE 5173

CMD ["npm", "run", "dev"]
