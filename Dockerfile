FROM node:18-alpine
WORKDIR /code
RUN npm i -g corepack
COPY . .
RUN yarn
CMD ["dist/js/index.js"]
