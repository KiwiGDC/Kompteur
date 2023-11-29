FROM debian:bookworm

RUN apt-get update && apt-get install -y nginx nodejs npm

COPY . /var/www/html

RUN cd /var/www/html && npm install

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
