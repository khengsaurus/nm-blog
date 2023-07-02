FROM node:18.10.0

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn build

EXPOSE 8080

CMD ["node", "build/app.js"]