#FROM xolocalvendors/nodebox:latest
FROM node:0.10

MAINTAINER reharik@gmail.com

ENV PLUGIN_HOME /opt/app/current

RUN npm install mocha -g
RUN npm install babel -g

EXPOSE 3000
EXPOSE 5858

#ENTRYPOINT ["docker-shell"]

#CMD ["-r"]

RUN mkdir /opt/app
RUN mkdir /opt/app/current

WORKDIR $PLUGIN_HOME

# Add shell script for starting container
#ADD ./docker/docker-shell.sh $PLUGIN_HOME/docker-shell
#RUN chmod +x $PLUGIN_HOME/docker-shell

ADD ./package.json $PLUGIN_HOME/package.json

RUN npm install

ADD . $PLUGIN_HOME
