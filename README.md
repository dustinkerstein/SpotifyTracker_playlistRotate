### Forked from https://github.com/StanvBaarsen/SpotifyTracker - Thanks goes to [@StanvBaarsen](https://github.com/StanvBaarsen)

# Development Setup
1. `git clone https://github.com/dustinkerstein/SpotifyTracker_playlistRotate.git`
1. `cd SpotifyTracker_playlistRotate`
1. Start your preferred http server
1. Create a new [Spotify app](https://developer.spotify.com/dashboard/applications/)
1. Edit Spotify app and add Redirect URI, ie. `http://localhost:8080/callback.html`
1. Configure `playlistIDs` and `clientID` variables in `main.js`
1. Launch browser to root URI, ie. http://localhost:8080/

# To Do
1. OAuth timeout at 60 minutes. Would need to get renewal token. Might ping upstream maintainer about this.
1. Due to current polling design / timing, there is brief playback of the next song before switching playlists. Could possibly use progress updates and set volume immediately before / after song change.

# Known Issues
- [Sonos playback broken](https://community.spotify.com/t5/Spotify-for-Developers/Sonos-speakers-not-showing-in-GET-player-devices/td-p/5175462)