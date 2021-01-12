FROM node:12.20.0-alpine
FROM linuxserver/ffmpeg:4.3-cli-ls2

#RUN apt-get install --no-cache ffmpeg -y
WORKDIR /app
COPY package*.json ./
COPY dist dist
COPY public public
COPY views views
ENTRYPOINT ["npm", "run", "start:prod"]
EXPOSE 3000