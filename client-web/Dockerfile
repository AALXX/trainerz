# Use the official Node.js 18 image as the base image
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Next.js will run on
EXPOSE 3000

# Start the Next.js development server  
CMD ["npm", "run", "dev"]
