# base image
FROM mhart/alpine-node:7.6.0
# set working directory to /src
WORKDIR /src
# Add app source files to container
ADD src /src
# Add run script
COPY run.sh /run.sh
# install node modules
RUN npm install
# move node_modules outside src since 
# src will be replaced by mounting 
# git volume
RUN mv /src/node_modules /node_modules
# set NODE_PATH to respect outside src 
ENV NODE_PATH /node_modules:$NODE_PATH
# set run script as entrypoint
CMD ["/run.sh"]
