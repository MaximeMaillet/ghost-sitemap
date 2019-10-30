FROM node:10.15.3

ENV NODE_ENV=production
RUN mkdir -p /app
WORKDIR /app
COPY ./ /app
RUN npm install --production

VOLUME [ "/app/public" ]

CMD [ "npm", "start" ]