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
