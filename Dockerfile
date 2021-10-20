FROM node

RUN mkdir /var/www
RUN mkdir /var/images
ADD package-lock.json /var/www
ADD package.json /var/www
WORKDIR /var/www
RUN npm i
ADD . /var/www

ENTRYPOINT ["node", "index.js"]
