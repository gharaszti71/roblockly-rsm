FROM nodejs

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
	apt-get install -y git && \
	git clone https://github.com/gharaszti71/roblockly-rsm

COPY config.json /roblockly-rsm/config
WORKDIR /roblockly-rsm
RUN npm install

ENV PORT=3000
ENV JWT_SECRET=valaminagyontitkosjelszotkeneadni

CMD ["bash","-c","npm start"]

EXPOSE 3000
