FROM node:18

WORKDIR /app

# Add user and set npm global directory
RUN mkdir -p /home/node_user/.npm-global && \
    useradd -m -s /bin/bash node_user && \
    chown -R node_user:node_user /app /home/node_user

# Set npm to use custom global directory
ENV NPM_CONFIG_PREFIX=/home/node_user/.npm-global
ENV PATH=$PATH:/home/node_user/.npm-global/bin

# Switch to non-root user
USER node_user

# Copy package files with correct ownership
COPY --chown=node_user:node_user package*.json ./

# Install dependencies
RUN npm install

# Copy project files with correct ownership
COPY --chown=node_user:node_user . .

EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
