# soundbounce-v2
Soundbounce v2 - web-based rebuild of Soundbounce using new Spotify Web Connect Player api

http://soundbounce.org

To get dev environment up and running locally:

- Install node (v6+), yarn, postgres.
- Create an app on Spotify developer portal.
- Clone this repo.
- Copy config/secrets/secrets-example.js to /config/secrets/secrets.js and enter your spotify app info
- `yarn install`
- `npm run-script dev`

Then open your browser `http://localhost:1337/`

