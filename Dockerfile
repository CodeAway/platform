FROM mhart/alpine-node:4.4

ADD app /app
RUN npm install
CMD runserver.sh
