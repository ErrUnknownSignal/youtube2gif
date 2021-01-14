FROM linuxserver/ffmpeg:4.3-cli-ls2
FROM node:12.20.0-alpine
COPY --from=0 / /


WORKDIR /app
COPY package*.json ./
COPY dist dist
COPY public public
COPY views views
COPY node_modules node_modules
CMD ["npm", "run", "start:prod"]
EXPOSE 3000