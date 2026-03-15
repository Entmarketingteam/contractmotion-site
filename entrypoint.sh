#!/bin/sh
PORT=${PORT:-8080}
sed "s/PORT_PLACEHOLDER/${PORT}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
