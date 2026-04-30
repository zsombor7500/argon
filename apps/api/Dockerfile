FROM docker.io/node:lts-alpine

RUN mkdir -p /var/lib/argon
WORKDIR /var/lib/argon

COPY dist .

RUN npm --omit=dev -f install

CMD [ "node", "main.js" ]