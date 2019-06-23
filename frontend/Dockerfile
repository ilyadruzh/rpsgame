FROM nginx

LABEL   maintainer="krondev@pm.me" \
        org.label-schema.build-date="n/a" \
        org.label-schema.name="rpsgame-front" \
        org.label-schema.description="frontend" \
        org.label-schema.vendor="" \
        org.label-schema.vcs-url="" \
        org.label-schema.vcs-ref="n/a" \
        org.label-schema.version="n/a"

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx/front.conf /etc/nginx/conf.d/

COPY build /var/www/front
