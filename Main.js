var access_token;
var player = {
	currentSong: null,
	playing: false,
	timestamp: 0
}
var isPaused = false;
var auth_url = "https://accounts.spotify.com/authorize?client_id=2f8e2442a3ec491cbdcfa556487e9de4&redirect_uri=" + encodeURI(location.href.split(location.pathname)[0] + "/SpotifyTracker/callback.html") + "&scope=user-read-private%20user-read-email%20user-modify-playback-state%20user-read-playback-state%20user-top-read&response_type=token";

onload = function () {
	if (!('localStorage' in window)) {
		document.write("<p>Sorry, de pagina is nu alleen gemaakt voor moderne browsers (Chrome, bij voorkeur).</p>");
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
				document.getElementById('load').addEventListener('click', loadData);
				document.getElementById('pause').addEventListener('click', function () {
					controlPlayback('pause');
				});
				document.getElementById('play').addEventListener('click', function () {
					controlPlayback('play');
				});

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

function request(method, path, callback) {
	if (!checkSignIn()) {
		alert("Er ging iets mis met de authorisatie!");
		signOut();
		return;
	}
	let xml = new XMLHttpRequest();
	xml.open(method, 'https://api.spotify.com/v1/' + path);
	xml.onreadystatechange = callback;
	xml.setRequestHeader('Authorization', 'Bearer ' + access_token)
	xml.send();
}

function loadData() {
	request('GET', 'me/top/tracks', function () {
		if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
			result = JSON.parse(this.response);
			if (!result || !('items' in result)) {
				alert("Er ging iets mis!");
			} else {
				let items = result.items;
				let html = '<h1>Meest geluisterde nummers</h1>';
				for (let i = 0; i < items.length; i++) {
					const el = items[i];
					html += '<li>' + el.artists[0].name + " - " + el.name + '</li>'
				}
				document.getElementById("tracks").innerHTML = html;
			}
		}
	});


	request('GET', 'me/top/artists', function () {
		if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
			result = JSON.parse(this.response);
			if (!result || !('items' in result)) {
				alert("Er ging iets mis!");
			} else {
				let items = result.items;
				let html = '<h1>Meest geluisterde artiesten</h1>';
				for (let i = 0; i < items.length; i++) {
					const el = items[i];
					html += '<li>' + el.name + " - " + el.name + '</li>'
				}
				document.getElementById("artists").innerHTML = html;
			}
		}
	});
}

function signOut() {
	localStorage.removeItem('token_expiration');
	localStorage.removeItem('access_token');
	location.reload();
}


function controlPlayback(action) {
	request('PUT', 'me/player/' + action, function () {
		if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
			let result = JSON.parse(this.response);
			updatePlayer()
		}
	})
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
			player.currentSong = null;
			player.isPaused = false;
			let playerEl = document.getElementById("playerData");
			if (this.status === 200) {
				if (!this.response) return;
				let res = JSON.parse(this.response);
				if (!res) return;
				player.currentSong = res.item;
				player.timestamp = res.timestamp;
				player.playing = res.is_playing;
				player.progress = res.progress_ms;
				let html = "<b>Nu aan het afspelen:</b> " + player.currentSong.artists[0].name + " - " + player.currentSong.name;
				if (!player.playing) {
					html += ' (gepauzeerd)';
				}
				playerEl.innerHTML = html;
				updateTimer();
			} else {
				playerEl.innerHTML = "<b>Momenteel niets aan het afspelen.</b>";
			}
		}
	})
}


function updateTimer() {
	let timer = document.getElementById('timer');
	let prependZero = function (n) {
		return n < 10 ? ('0' + n) : n;
	}
	let parseTime = function (t) {
		return prependZero(Math.floor(t / 60000)) + ":" + prependZero(Math.floor(t / 1000) % 60);
	}
	if (player.currentSong) {
		let progress = player['progress'];
		let duration = player.currentSong['duration_ms'];
		if (player.playing) {
			let ts = player['timestamp'];
			let diff = +new Date() - ts;
			progress = diff;
			if(progress > duration){
				updatePlayer();
			}
		}
		timer.innerHTML = parseTime(progress) + '/' + parseTime(duration);
	} else {
		timer.innerHTML = '-/-';
	}
}