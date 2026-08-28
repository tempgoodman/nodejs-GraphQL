FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

RUN npm install -g @apollo/rover

COPY . .

RUN chmod +x start.sh

CMD ["./start.sh"]