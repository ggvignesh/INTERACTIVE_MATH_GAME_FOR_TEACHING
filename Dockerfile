# Simple PHP-Apache image for Render
FROM php:8.2-apache

# Enable Apache modules
RUN a2enmod rewrite headers && \
    sed -i 's!/var/www/html!/var/www/app!g' /etc/apache2/sites-available/000-default.conf && \
    sed -i 's!/var/www/!/var/www/app/!g' /etc/apache2/apache2.conf

WORKDIR /var/www/app

# Copy source
COPY . /var/www/app

# Ensure data folder is writable
RUN mkdir -p /var/www/app/data && chown -R www-data:www-data /var/www/app \
    && find /var/www/app -type d -exec chmod 755 {} \; \
    && find /var/www/app -type f -exec chmod 644 {} \; \
    && chmod 666 /var/www/app/data/scores.json || true

EXPOSE 8080

# Apache listens on 80 by default; Render respects PORT env. We'll proxy by setting env in start.
ENV APACHE_RUN_USER=www-data \
    APACHE_RUN_GROUP=www-data \
    APACHE_LOG_DIR=/var/log/apache2

CMD ["apache2-foreground"]


