### Forked from https://github.com/StanvBaarsen/SpotifyTracker - Thanks goes to [@StanvBaarsen](https://github.com/StanvBaarsen)

# Development Setup
1. `git clone https://github.com/dustinkerstein/SpotifyTracker_playlistRotate.git`
1. `cd SpotifyTracker_playlistRotate`
1. Start your preferred http server
1. Create a new [Spotify app](https://developer.spotify.com/dashboard/applications/)
1. Edit Spotify app and add Redirect URI, ie. `http://localhost:8080/callback.html`
1. Launch browser to root URI, ie. http://localhost:8080/

# ToDo
1. Due to current polling design / timing, there is brief playback of the next song before switching playlists

# Known Issues
- [Sonos playback broken](https://community.spotify.com/t5/Spotify-for-Developers/Sonos-speakers-not-showing-in-GET-player-devices/td-p/5175462)