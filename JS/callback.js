onload = async function () {
	auth_code = (new URLSearchParams(window.location.search)).get('code')
	if (auth_code) {
		if ('localStorage' in window && 'fetch' in window) {
			var xhr = new XMLHttpRequest();
			var data = "grant_type=authorization_code&code=" + auth_code + "&redirect_uri=" + redirectURI;
			xhr.addEventListener("readystatechange", function () {
				if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
					let res = JSON.parse(this.response)
					if (res.access_token) {
						access_token = res.access_token
						localStorage.setItem("access_token", access_token);
						localStorage.setItem("refresh_token", res.refresh_token);
						localStorage.setItem("token_expiration", "" + new Date(+new Date() + 0 + (+res.expires_in) * 1000))
						location = location.href.split("/SpotifyTracker").length > 1 ? "../SpotifyTracker/" : "../"
					} else {
						writeError();
					}
				}
			});

			xhr.open("POST", "https://accounts.spotify.com/api/token");
			xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			xhr.setRequestHeader("Authorization", "Basic " + btoa(clientID + ':' + clientSecret))

			xhr.send(data);
		} else {
			writeError();
		}
	} else {
		writeError();
	}
}

function writeError() {
	document.write("Er is iets mis gegaan. <a href='../SpotifyTracker/'>Terug naar home</a>");
}