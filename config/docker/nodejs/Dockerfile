FROM ubuntu:16.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
	apt-get install -y curl python-software-properties && \
	curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh && \
	bash nodesource_setup.sh && \
	apt-get install -y nodejs && \
	rm nodesource_setup.sh
