FROM node:14-alpine
LABEL authors="a_abramenko"
WORKDIR /www/ps_bnb
ADD package.json package.json
RUN npm install
ADD . .
RUN npm run build
RUN npm prune --production
CMD ["node", "./dist/main.js"]
