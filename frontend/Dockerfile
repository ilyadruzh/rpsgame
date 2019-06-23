FROM nginx

LABEL   maintainer="krondev@pm.me" \
        org.label-schema.build-date="n/a" \
        org.label-schema.name="rpsgame-front" \
        org.label-schema.description="frontend" \
        org.label-schema.vendor="I-Teco" \
        org.label-schema.vcs-url="gitlab.dfu.i-teco.ru:blockchain/wagdb.git" \
        org.label-schema.vcs-ref="n/a" \
        org.label-schema.version="n/a"

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx/front.conf /etc/nginx/conf.d/

COPY build /var/www/front
