FROM node:latest

MAINTAINER reharik@gmail.com

ENV PLUGIN_HOME /home/app/current

RUN npm install mocha -g
RUN npm install babel -g

RUN mkdir -p $PLUGIN_HOME

WORKDIR $PLUGIN_HOME

ADD ./package.json $PLUGIN_HOME/package.json

RUN npm install
RUN mv node_modules ../

ADD . $PLUGIN_HOME
