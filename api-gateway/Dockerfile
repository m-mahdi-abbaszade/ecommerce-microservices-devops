FROM nginx:1.25-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Note: nginx -t removed because upstream services don't exist at build time.
# Nginx validates config automatically on startup via CMD.

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
