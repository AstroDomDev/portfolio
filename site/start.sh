#!/bin/bash

# Change to the directory where your Flask app is located
cd /home/dom/portfolio/site

# Activate the virtual environment (if you're using one)
source env/bin/activate

# Start Gunicorn for HTTP (port 80)
sudo /home/dom/portfolio/site/env/bin/gunicorn --bind 0.0.0.0:80 -k eventlet main:app --log-level=info &

# Start Gunicorn for HTTPS (port 443)
sudo /home/dom/portfolio/site/env/bin/gunicorn --bind 0.0.0.0:443 -k eventlet main:app --log-level=info --certfile=cert.pem --keyfile=privkey.pem --timeout 60 &
