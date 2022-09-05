### Forked from https://github.com/StanvBaarsen/SpotifyTracker - Thanks goes to [@StanvBaarsen](https://github.com/StanvBaarsen)

# Google Apps Script Production Setup
1. Create a new [Spotify app](https://developer.spotify.com/dashboard/applications/) and give it a friendly name
1. Create a new [Google Apps Script project](https://script.google.com/home/projects/create) and give it a friendly name
1. From this GitHub Repo, paste the code found in  `code.gs` into already created `code.gs` file in the Google Apps Script project
1. On the top left, create two HTML files: `index` and `callback` and paste in their respective code from this Repo
1. Configure `playlistIDs` and `clientID` variables in `index.html` - Note playlist IDs can be found in the desktop web Spotify app by clicking on a playlist and copying the ID from the URL. `clientID` can be found in the Spotify Developer Dashboard for your new app
1. Hit the `Deploy` button and select `New Deployment` and then hit the gear icon and select `Web app`. Leave everything else at the default and hit `Deploy`
1. Again hit the `Deploy` button but this time select `Test deployments`. Copy that url and paste it into the `url` parameter in the `code.gs` file
1. Back in the Spotify Developer Dashboard, edit Spotify app and use the dev url as your Redirect URI, but add `?callback` to the end of the url, ie. `https://script.google.com/macros/s/AKfycbyrkbmXjuR3LPoHfbGFF7hZqEyMyUMpgd0kY7tOViFQ/dev?callback`
1. Open a new browser tab and paste in the dev url (without `?callback`). You should be able to log in and control an existing Spotify device (ie. web player or iOS app)

# To Do
1. OAuth timeout at 60 minutes. Would need to get renewal token. Might ping upstream maintainer about this.
1. Due to current polling design / timing, there is brief playback of the next song before switching playlists. Could possibly use progress updates and set volume immediately before / after song change.

# Known Issues
- [Sonos playback broken](https://community.spotify.com/t5/Spotify-for-Developers/Sonos-speakers-not-showing-in-GET-player-devices/td-p/5175462)
- There might be some funky behavior when using multiple remotes and hitting next / previous. Needs to be investigated at some point. 
- Related to the above, there's some business logic to define for how to handle next / previous clicks. Ie. should they stay within the current playlist, or should next (likely not previous) count towards the "uniqueSongCounter"? Currently, if you use the next / previous buttons in the custom app, it won't count those, but external next / previous events (ie. from your phone) do count towards "uniqueSongCounter".

# Other Notes
- Change `numberSongsToPlay` in `index.html` to the number of songs you'd like to play before moving to the next playlist. This could easily be moved to the UI.