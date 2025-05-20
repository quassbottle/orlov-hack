FROM node:20-alpine AS dependencies
RUN npm install -g pnpm
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node . .
RUN pnpm i

FROM dependencies AS build
WORKDIR /home/node/app

RUN pnpm run build

FROM node:20-alpine
RUN npm install -g pnpm
RUN npm install -g serve
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node --from=build /home/node/app .

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]