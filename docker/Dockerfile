FROM mf/nodebox:latest

MAINTAINER reharik@gmail.com

ENV PLUGIN_HOME /home/opt/app/current

RUN mkdir -p $PLUGIN_HOME

ADD ./package.json ./package.json

RUN npm-install-missing

WORKDIR $PLUGIN_HOME

ADD . $PLUGIN_HOME
