var access_token;
let redirectURI = encodeURI(location.origin + (location.href.split("/SpotifyTracker/").length > 1 ? "/SpotifyTracker" : '') + "/callback.html")
const clientID = "2f8e2442a3ec491cbdcfa556487e9de4"
const clientSecret = '8cf495c7fcde43e9b115d89bac6eefa3'
var auth_url = "https://accounts.spotify.com/authorize?client_id=" + clientID + "&redirect_uri=" + redirectURI + "&scope=user-read-private%20user-read-email%20user-modify-playback-state%20user-read-playback-state%20user-top-read%20user-read-recently-played&response_type=code";
var isLoggingOff = false;

async function request(method, path, data) {
	return new Promise(resolve => {
		(async () => {
			let xhr = new XMLHttpRequest();
			xhr.open(method, 'https://api.spotify.com/v1/' + path);
			xhr.onreadystatechange = function () {
				if (this.readyState == XMLHttpRequest.DONE) {
					if (this.status === 200) {
						resolve(JSON.parse(this.response))
					} else {
						if(this.response) {
							resolve({ ...JSON.parse(this.response), ...{ status: this.status } })
						} else {
							resolve({ status: this.status })
						}
					}
				};
			}
			xhr.setRequestHeader('Authorization', 'Bearer ' + await getAccessToken())
			xhr.send(data ? JSON.stringify(data) : undefined);
		})()
	})
}

function signOut() {
	localStorage.removeItem('token_expiration');
	localStorage.removeItem('access_token');
	localStorage.removeItem('refresh_token');
	isLoggingOff = true;
	location.reload();
}

async function controlPlayback(action, method, params, data) {
	let result = await request(method || 'PUT', 'me/player/' + action + (params || ""), data || {})
	if (result.status === 200) {
		if (updatePlayer) updatePlayer();
	} else if (result.status === 404) {
		if ((JSON.parse(this.response || {}).error || {}).reason == 'NO_ACTIVE_DEVICE') {
			alert('Geen apparaat beschikbaar!')
		}
	}
}

async function getAccessToken() {
	return new Promise(resolve => {
		let expiration = localStorage.getItem("token_expiration");
		if (expiration && (new Date(expiration) > new Date())) {
			// we don't need a new access token
			resolve(localStorage.getItem('access_token'))
		} else {
			var xhr = new XMLHttpRequest();
			var data = "grant_type=refresh_token&refresh_token=" + localStorage.getItem('refresh_token');
			xhr.addEventListener("readystatechange", function () {
				if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
					let res = JSON.parse(this.response)
					if (res.access_token) {
						access_token = res.access_token
						localStorage.setItem("access_token", access_token);
						localStorage.setItem("token_expiration", "" + new Date(+new Date() + (+res.expires_in) * 1000));
						resolve(access_token)
					} else {
						writeError();
					}
				}
			});

			xhr.open("POST", "https://accounts.spotify.com/api/token");
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(clientID + ':' + clientSecret))

			xhr.send(data);
		}
	})
}