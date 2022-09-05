var player = {};
var isPaused = false;
var hasAlerted = false;
var searchQuery;
var availableDevice;
var playerUpdate;

onload = async function () {
	if (!('localStorage' in window)) {
		document.write("<p>Sorry, de pagina is alleen gemaakt voor moderne browsers (Chrome, bij voorkeur).</p>");
	} else {
		if (localStorage.getItem('refresh_token')) {
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

			document.getElementById("loading").classList.add("hidden");

			updatePlayer();
			updateTimer();
			setInterval(updatePlayer, 1000);
			setInterval(updateTimer, 250);
			let result = await request("GET", 'me')
			document.getElementById("user").innerHTML = " als " + result.display_name + " (" + result.email + ")";
		} else {
			document.getElementById("newLogin").setAttribute("href", auth_url);
			document.getElementById("notLoggedIn").classList.add("shown");
			document.getElementById("loading").classList.add("hidden");
		}
	}
}


async function loadFavourites() {
	if (document.getElementById("loadFavourites").innerHTML != 'Laad je favorieten-lijst') {
		document.getElementById("artists").innerHTML = '';
		document.getElementById("tracks").innerHTML = '';
		document.getElementById("loadFavourites").innerHTML = 'Laad je favorieten-lijst';
		return;
	}

	let result_artists = await request('GET', 'me/top/artists?time_range=short_term')
	document.getElementById("artists").innerHTML = '';
	document.getElementById("tracks").innerHTML = '';
	if (!result_artists || !('items' in result_artists)) {
		document.getElementById("artists").innerHTML = '<b>Er ging iets mis!</b>';
	} else {
		let items = result_artists.items;
		let html = '<h1>Meest geluisterde artiesten (laatste 4 weken)</h1>';
		for (let i = 0; i < items.length; i++) {
			const el = items[i];
			html += '<li>' + el.name + '</li>'
		}
		document.getElementById("artists").innerHTML = html;
		document.getElementById("loadFavourites").innerHTML = 'Maak lijst met favorieten leeg';
	}

	let result_tracks = await request('GET', 'me/top/tracks?time_range=short_term')
	if (!result_tracks || !('items' in result_tracks)) {
		alert("Er ging iets mis!");
	} else {
		let items = result_tracks.items;
		let html = '<h1>Meest geluisterde nummers (laatste 4 weken)</h1>';
		for (let i = 0; i < items.length; i++) {
			const el = items[i];
			html += '<li>' + el.artists[0].name + " - " + el.name + '</li>'
		}
		document.getElementById("tracks").innerHTML = html;
	}
}


async function updatePlayer() {
	let result = await request("GET", "me/player")
	player.isPaused = false;
	let playerEl = document.getElementById("playerData");
	if (result.status && player.status !== 200) {
		playerEl.innerHTML = "<b>Momenteel niets aan het afspelen.</b>";
		document.getElementById("playback").classList.remove("shown");
		checkDevices();
	} else {
		if (!result) return;
		player = result;
		playerUpdate = +new Date();

		let html = "<b>Nu aan het afspelen" + (!player.is_playing ? " (gepauzeerd)" : "") + ":</b> ";
		if (player.item) {
			html += player.item.artists[0].name + " - " + player.item.name;
		}

		document.getElementById("pauseplay").innerHTML = player.is_playing ? "Pauzeer" : "Play";
		playerEl.innerHTML = html;
		document.getElementById("shuffle").innerHTML = 'Zet shuffle ' + (result['shuffle_state'] ? 'uit' : 'aan');
		updateTimer();
		document.getElementById("playback").classList.add("shown");
		document.getElementById("lastPlayer").classList.remove("shown");
	}
}

async function checkDevices() {
	let result = await request("GET", "me/player/devices")
	availableDevice = null;
	if (result.devices.length > 0) {
		availableDevice = result.devices[0];
		document.getElementById("lastPlayer").classList.add("shown");
	} else {
		document.getElementById("lastPlayer").classList.remove("shown");
	}
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
	setTimeout(async function () {
		searchQuery = '';
		searchQuery = prompt("Zoekopdracht");
		if (!searchQuery || !searchQuery.length) return;
		let result = await request('GET', 'search?type=track,album,artist&market=nl&q=' + searchQuery)
		let albums = result.albums.items;
		let artists = result.artists.items;
		let tracks = result.tracks.items;

		let html = '<br><b>Gezocht op: </b>' + searchQuery + '<br><button id="clearSearch">Clear zoekopdracht</button><br><br><br>';


		if (artists.length) {
			html += '<b>Gevonden Artiesten</b><ul>';
			for (let i = 0; i < artists.length && i < 3; i++) {
				html += '<li>' + artists[i].name + "&nbsp;&nbsp;&nbsp;<button class='playURI' URI=" + artists[i].uri + ">Afspelen</button></li>";
			}
			html += '</ul>';
		}

		if (tracks.length) {
			html += '<b>Gevonden Nummers</b><ul>';
			for (let i = 0; i < tracks.length && i < 12; i++) {
				html += '<li>' + tracks[i].artists[0].name + " - " + tracks[i].name + "&nbsp;&nbsp;&nbsp;<button class='playURI' URI=" + tracks[i].uri + ">Afspelen</button></li>";
			}
			html += '</ul>';
		}

		if (albums.length) {
			html += '<b>Gevonden Albums</b><ul>';
			for (let i = 0; i < albums.length && i < 3; i++) {
				html += '<li>' + albums[i].artists[0].name + " - " + albums[i].name + "&nbsp;&nbsp;&nbsp;<button class='playURI' URI=" + albums[i].uri + ">Afspelen</button></li>";
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
	}, 50);
}