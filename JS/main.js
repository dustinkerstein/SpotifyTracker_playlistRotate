var access_token;
var player = {};
var isPaused = false;
var hasAlerted = false;
var isLoggingOff = false;
var searchQuery;
var availableDevice;
var playerUpdate;
var clientID = '1bf748e967504f8698da96022cd7f599';
var auth_url = "https://accounts.spotify.com/authorize?client_id=" + clientID + "&redirect_uri=" + encodeURI(location.origin + (location.href.split("/SpotifyTracker/").length > 1 ? "/SpotifyTracker" : '') + "/callback.html") + "&scope=user-read-private%20user-read-email%20user-modify-playback-state%20user-read-playback-state%20user-top-read%20user-read-recently-played&response_type=token";

onload = function () {
	if (!('localStorage' in window)) {
		document.write("<p>Sorry, the page is designed only for modern browsers.</p>");
	} else {
		let expiration = localStorage.getItem("token_expiration");
		if (expiration) {
			if (+new Date(expiration) < +new Date()) {
				document.getElementById("expiredLogin").setAttribute("href", auth_url);
				document.getElementById("expired").classList.add("shown");
			} else {
				access_token = localStorage.getItem("access_token");
				document.getElementById("loggedIn").classList.add("shown");
				document.getElementById('signout').addEventListener('click', signOut);
				document.getElementById('loadFavourites').addEventListener('click', loadFavourites);
				document.getElementById('lastPlayer').addEventListener('click', newPlayback);
				document.getElementById('search').addEventListener('click', search);
				document.getElementById('pauseplay').addEventListener('click', function () {
					controlPlayback(player ? (player.is_playing ? 'pause' : 'play') : '');
				});
				document.getElementById('next').addEventListener('click', function () {
					controlPlayback('next', 'POST');
				});
				document.getElementById('prev').addEventListener('click', function () {
					controlPlayback('previous', 'POST');
				});
				document.getElementById('shuffle').addEventListener('click', function () {
					controlPlayback('shuffle', 'PUT', '?state=' + ("" + (!player.shuffle_state) || 'true'));
				});

				request("GET", 'me', function () {
					if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
						let res = JSON.parse(this.response);
						document.getElementById("user").innerHTML = " as " + res.display_name + " (" + res.email + ")";
					}
				})


				updatePlayer();
				updateTimer();
				setInterval(updatePlayer, 1000);
				setInterval(updateTimer, 250);
			}
		} else {
			document.getElementById("newLogin").setAttribute("href", auth_url);
			document.getElementById("notLoggedIn").classList.add("shown");
		}
		document.getElementById("loading").classList.add("hidden");
	}
}

function request(method, path, callback, data) {
	if (!checkSignIn()) {
		if (!hasAlerted && !isLoggingOff) {
			hasAlerted = true;
			alert("Something went wrong with authorization.");
			location.reload();
		}
		return;
	}
	let xml = new XMLHttpRequest();
	xml.open(method, 'https://api.spotify.com/v1/' + path);
	xml.onreadystatechange = callback;
	xml.setRequestHeader('Authorization', 'Bearer ' + access_token)
	xml.send(data ? JSON.stringify(data) : undefined);
}

function loadFavourites() {
	if (document.getElementById("loadFavourites").innerHTML != 'Load favorites list') {
		document.getElementById("artists").innerHTML = '';
		document.getElementById("tracks").innerHTML = '';
		document.getElementById("loadFavourites").innerHTML = 'Load favorites list';
		return;
	}
	request('GET', 'me/top/artists?time_range=short_term', function () {
		if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
			document.getElementById("artists").innerHTML = '';
			document.getElementById("tracks").innerHTML = '';
				result = JSON.parse(this.response);
			if (!result || !('items' in result)) {
				document.getElementById("artists").innerHTML = '<b>Something went wrong.</b>';
			} else {
				let items = result.items;
				let html = '<h1>Most listened to artists (last 4 weeks)</h1>';
				for (let i = 0; i < items.length; i++) {
					const el = items[i];
					html += '<li>' + el.name + '</li>'
				}
				document.getElementById("artists").innerHTML = html;
				document.getElementById("loadFavourites").innerHTML = 'Clear favorites list';
			}
		}
	});

	request('GET', 'me/top/tracks?time_range=short_term', function () {
		if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
			result = JSON.parse(this.response);
			if (!result || !('items' in result)) {
				alert("Something went wrong.");
			} else {
				let items = result.items;
				let html = '<h1>Most listened to songs (last 4 weeks)</h1>';
				for (let i = 0; i < items.length; i++) {
					const el = items[i];
					html += '<li>' + el.artists[0].name + " - " + el.name + '</li>'
				}
				document.getElementById("tracks").innerHTML = html;
			}
		}
	});
}

function signOut() {
	localStorage.removeItem('token_expiration');
	localStorage.removeItem('access_token');
	isLoggingOff = true;
	location.reload();
}


function controlPlayback(action, method, params, data) {
	request(method || 'PUT', 'me/player/' + action + (params || ""), function () {
		if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
			let result = JSON.parse(this.response);
			updatePlayer();
		}
	}, data || {})
}

function checkSignIn() {
	let expiration = localStorage.getItem("token_expiration");
	if (expiration && (+new Date(expiration) > +new Date())) {
		return true;
	} else return false;
}


function updatePlayer() {
	request("GET", "me/player", function () {
		if (this.readyState == XMLHttpRequest.DONE) {
			player.isPaused = false;
			let playerEl = document.getElementById("playerData");
			if (this.status === 200) {
				if (!this.response) return;
				let res = JSON.parse(this.response);
				if (!res) return;
				player = res;
				playerUpdate = +new Date();

				let html = "<b>Now playing" + (!player.is_playing ? " (paused)" : "") + ":</b> ";
				html += player.item.artists[0].name + " - " + player.item.name;

				document.getElementById("pauseplay").innerHTML = player.is_playing ? "Pause" : "Play";
				playerEl.innerHTML = html;
				document.getElementById("shuffle").innerHTML = 'Set shuffle ' + (res['shuffle_state'] ? 'off' : 'on');
				updateTimer();
				document.getElementById("playback").classList.add("shown");
				document.getElementById("lastPlayer").classList.remove("shown");
			} else {
				playerEl.innerHTML = "<b>Nothing playing at the moment.</b>";
				document.getElementById("playback").classList.remove("shown");
				checkDevices();
			}
		}
	})
}

function checkDevices() {
	request("GET", "me/player/devices", function () {
		if (this.readyState == XMLHttpRequest.DONE) {
			availableDevice = null;
			res = JSON.parse(this.response);
			if (res.devices.length > 0) {
				availableDevice = res.devices[0];
				document.getElementById("lastPlayer").classList.add("shown");
			} else {
				document.getElementById("lastPlayer").classList.remove("shown");
			}
		}
	});
}


function updateTimer() {
	let timer = document.getElementById('timer');
	let prependZero = function (n) {
		return n < 10 ? ('0' + n) : n;
	}
	let parseTime = function (t) {
		return prependZero(Math.floor(t / 60000)) + ":" + prependZero(Math.floor(t / 1000) % 60);
	}
	if (player.item) {
		let progress = player['progress_ms'];
		let duration = player.item['duration_ms'];
		if (player.is_playing) {
			let ts = playerUpdate;
			let diff = +new Date() - ts;
			progress += diff;
			if (progress > duration) {
				updatePlayer();
			}
		}
		timer.innerHTML = parseTime(progress) + '/' + parseTime(duration);
	} else {
		timer.innerHTML = '-/-';
	}
}


function newPlayback() {
	controlPlayback('', "PUT", '', {
		device_ids: [availableDevice.id],
		play: true
	});
}

function search() {
	document.getElementById("searchResults").innerHTML = '';
	setTimeout(function () {
		searchQuery = '';
		searchQuery = prompt("Search");
		if (!searchQuery || !searchQuery.length) return;
		request('GET', 'search?type=track,album,artist&market=nl&q=' + searchQuery, function () {
			if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
				let res = JSON.parse(this.response);
				let albums = res.albums.items;
				let artists = res.artists.items;
				let tracks = res.tracks.items;

				let html = '<br><b>Searched for: </b>' + searchQuery + '<br><button id="clearSearch">Clear search</button><br><br><br>';


				if (artists.length) {
					html += '<b>Found Artists</b><ul>';
					for (let i = 0; i < artists.length && i < 3; i++) {
						html += '<li>' + artists[i].name + "&nbsp;&nbsp;&nbsp;<button class='playURI' URI=" + artists[i].uri + ">Play</button></li>";
					}
					html += '</ul>';
				}

				if (tracks.length) {
					html += '<b>Found Songs</b><ul>';
					for (let i = 0; i < tracks.length && i < 12; i++) {
						html += '<li>' + tracks[i].artists[0].name + " - " + tracks[i].name + "&nbsp;&nbsp;&nbsp;<button class='playURI' URI=" + tracks[i].uri + ">Play</button></li>";
					}
					html += '</ul>';
				}

				if (albums.length) {
					html += '<b>Found Albums</b><ul>';
					for (let i = 0; i < albums.length && i < 3; i++) {
						html += '<li>' + albums[i].artists[0].name + " - " + albums[i].name + "&nbsp;&nbsp;&nbsp;<button class='playURI' URI=" + albums[i].uri + ">Play</button></li>";
					}
					html += '</ul>';
				}

				document.getElementById("searchResults").innerHTML = html;
				document.getElementById("clearSearch").addEventListener("click", function () {
					document.getElementById("searchResults").innerHTML = '';
				});

				let btns = document.getElementsByClassName("playURI");
				for (let i = 0; i < btns.length; i++) {
					const btn = btns[i];
					btn.addEventListener('click', function () {
						let uri = this.attributes.uri.value;

						let data = uri.startsWith("spotify:track") ? { uris: [uri], } : { context_uri: uri, };
						controlPlayback('play', "PUT", '', data);
					})
				}
			}
		});
	}, 50);
}