FROM nginx:1.27-alpine

COPY docker/nginx.http.conf /etc/nginx/docker-templates/http.conf
COPY docker/nginx.https.conf /etc/nginx/docker-templates/https.conf
COPY docker/docker-entrypoint.d/50-choose-nginx-config.sh /docker-entrypoint.d/50-choose-nginx-config.sh
RUN chmod +x /docker-entrypoint.d/50-choose-nginx-config.sh

COPY docker/nginx.http.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/

EXPOSE 80 443
