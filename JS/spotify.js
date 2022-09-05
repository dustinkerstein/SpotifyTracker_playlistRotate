var access_token;
var auth_url = "https://accounts.spotify.com/authorize?client_id=2f8e2442a3ec491cbdcfa556487e9de4&redirect_uri=" + encodeURI(location.origin + (location.href.split("/SpotifyTracker/").length > 1 ? "/SpotifyTracker" : '') + "/callback.html") + "&scope=user-read-private%20user-read-email%20user-modify-playback-state%20user-read-playback-state%20user-top-read%20user-read-recently-played&response_type=token";
var isLoggingOff = false;

function request(method, path, callback, data) {
	if (!checkSignIn()) {
		if (!hasAlerted && !isLoggingOff) {
			hasAlerted = true;
			alert("Er ging iets mis met de authorisatie!");
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

function signOut() {
	localStorage.removeItem('token_expiration');
	localStorage.removeItem('access_token');
	isLoggingOff = true;
	location.reload();
}

function checkSignIn() {
	let expiration = localStorage.getItem("token_expiration");
	if (expiration && (new Date(expiration) > new Date())) {
		return true;
	} else return false;
}


function controlPlayback(action, method, params, data) {
	request(method || 'PUT', 'me/player/' + action + (params || ""), function () {
		if (this.readyState == XMLHttpRequest.DONE) {
			if (this.status === 200) {
				let result = JSON.parse(this.response);
				if (updatePlayer) updatePlayer();
			} else if(this.status === 404) {
				if((JSON.parse(this.response||{}).error||{}).reason == 'NO_ACTIVE_DEVICE') {
					alert('Geen apparaat beschikbaar!')
				}
			}
		}
	}, data || {})
}
