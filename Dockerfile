FROM docker.io/library/node:16.10.0-buster
ADD ./ /data/lpnode-graphql/
EXPOSE 18081
WORKDIR /data/lpnode-graphql/
RUN apt-get update
RUN yes|apt-get install libusb-1.0-0-dev
RUN yes|apt-get install libudev-dev
RUN npm i
# build
RUN npx gulp
# CMD [ "node", "main.js" ]
CMD [ "node", "dist/main.js" ]

