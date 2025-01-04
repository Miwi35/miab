FROM node:18

WORKDIR /app

RUN mkdir -p /home/node_user/.npm-global && \
    useradd -m -s /bin/bash node_user && \
    chown -R node_user:node_user /app /home/node_user

ENV NPM_CONFIG_PREFIX=/home/node_user/.npm-global
ENV PATH=$PATH:/home/node_user/.npm-global/bin

USER node_user

COPY --chown=node_user:node_user package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY --chown=node_user:node_user . .

EXPOSE 4200

CMD ["npm", "start"]
