# miab
Message in a bottle

## Description

Miab (for message in a bottle) is a secure platform for sharing messages with the world.
It distinguishes itself from other messaging apps by multiple criteria:
  - it's totally anonymous
  - message keystrokes are recorded and replayed, including:
    - character typing
    - text selection
    - deletions and edits
    - cursor movements
  - the messages are never stored on the server, they are only stored in the user's browser in a custom .miab format
  - messages are accessible publicly by sharing a link
  - 2 modes are available:
    - Broadcast: displays keystrokes in real-time as the user types
    - Replay: allows viewing a recorded message with full keystroke playback (if enabled by author)
  - secure links for broadcast/replay are generated server-side and stored server-side (anonymously)

## Technical details
  - Frontend: Angular 
    - Keystroke recording using event listeners
    - Local storage management
    - Replay animation engine
  - Backend: Node.js
  - Webserver: nginx
  - Provisioned with ansible
  - Dockerized for easy deployment

## Development Setup

### SSL Configuration (Development)

For local development with HTTPS:

1. Generate self-signed SSL certificates:
```bash
# Create SSL directory
mkdir -p docker/ssl

# Generate self-signed certificate and private key
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/ssl/nginx-selfsigned.key \
  -out docker/ssl/nginx-selfsigned.crt \
  -subj "/C=US/ST=CA/L=San Francisco/O=MIAB Dev/CN=localhost"
```

2. Add the following hosts to your `/etc/hosts` file:
```
127.0.0.1 miab.local
127.0.0.1 server.miab.local
```

3. Access the application:
   - Frontend: https://miab.local
   - Backend: https://server.miab.local

Notes: 
- Since we're using a self-signed certificate in development, your browser will show a security warning. This is normal and expected. Click "Advanced" and "Proceed" to access the site. In production, you should use proper SSL certificates from a trusted certificate authority.
- The SSL certificates are ignored by git and should not be committed. Each developer should generate their own certificates for local development.
