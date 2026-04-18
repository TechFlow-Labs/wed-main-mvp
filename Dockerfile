FROM nginx:1.27-alpine

COPY docker/nginx.http.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/

# COPY can preserve tight perms from host; nginx runs as non-root.
RUN chmod -R a+rX /usr/share/nginx/html

EXPOSE 80
