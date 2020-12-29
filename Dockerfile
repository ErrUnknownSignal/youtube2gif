FROM node:12.20.0-alpine
FROM linuxserver/ffmpeg:4.3-cli-ls2

#RUN apt-get install --no-cache ffmpeg -y
WORKDIR /app
ADD package.json package.json
ADD package-lock.json package-lock.json
RUN npm install
COPY . .
CMD ["npm", "run", "build"]
ENTRYPOINT ["npm", "run", "start:prod"]
EXPOSE 3000