FROM node:18
# Create proxy directory
WORKDIR /usr/src/proxy
# Install proxy dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Copy proxy source
COPY . .
# Run proxy server
CMD [ "node", "src/server.js" ]