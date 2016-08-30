FROM mhart/alpine-node:4.4

ADD app /app
WORKDIR app
RUN npm install
CMD /app/runserver.sh
