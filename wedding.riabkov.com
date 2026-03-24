server {
    server_name wedding.riabkov.com;

    # Пока просто проксируй куда нужно, или заглушка
    location / {
        # замени на свой upstream
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
	}

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/wedding.riabkov.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/wedding.riabkov.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = wedding.riabkov.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name wedding.riabkov.com;
    return 404; # managed by Certbot


}