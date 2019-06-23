# Node image
FROM node:latest

# Maintainer
MAINTAINER Ilya A. Druzhinin <ilya.druzh@gmail.com>

RUN mkdir -p /root/.config/configstore
RUN chmod g+rwx /root /root/.config /root/.config/configstore

# Install the packages
RUN npm install -g truffle

ADD . /opt/
