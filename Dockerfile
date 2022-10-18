FROM node:18-alpine
WORKDIR /code
RUN npm i -g corepack
COPY package.json .
RUN yarn
COPY . .
RUN yarn build
CMD ["dist/js/index.js"]
