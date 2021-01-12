FROM linuxserver/ffmpeg:4.3-cli-ls2
FROM node:12.20.0-alpine

# https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
COPY --from=0 / /

WORKDIR /app
COPY package*.json ./
COPY dist dist
COPY public public
COPY views views

# nest core
RUN npm install

ENTRYPOINT ["npm", "run", "start:prod"]
EXPOSE 3000