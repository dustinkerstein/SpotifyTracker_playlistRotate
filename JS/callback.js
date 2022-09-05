onload = function () {
	url = location.href;
	at = (url.split("access_token=")[1] || "").split("&")[0];
	ei = (url.split("expires_in=")[1] || "").split("&")[0];
	if (at && ei) {
		if ('localStorage' in window) {
			localStorage.setItem("token_expiration", "" + new Date(+new Date() + (+ei) * 1000));
			localStorage.setItem("access_token", at);
			location = url.split("/SpotifyTracker").length > 1 ? "../SpotifyTracker/" : "../"
			// request("POST", "token", function() {
			// 	if (this.readyState == XMLHttpRequest.DONE && this.status === 200) {
			// 		console.log(this)
			// 	}
			// }, {
			// 	grant_type: "authorization_token",
			// 	access_token: at
			// })
			
			// grant_type: 'refresh_token',
			// refresh_token: refresh_token
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