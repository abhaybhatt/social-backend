# Use a base Node.js image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the entire app directory to the working directory
COPY . .


# Expose the port on which the app will run
EXPOSE 8000

# Run the tests related post
RUN npm run test-posts-api

# Run the auth related post
RUN npm run test-auth-api

# Start the app
CMD [ "npm", "start" ]