var access_token;
var auth_url = "https://accounts.spotify.com/authorize?client_id=2f8e2442a3ec491cbdcfa556487e9de4&redirect_uri=http%3A%2F%2Fstannl.github.io%2FSpotifyTracker%2Fcallback.html&scope=user-read-private%20user-read-email%20user-top-read&response_type=token";

onload = function () {
	if (!('localStorage' in window)) {
		document.write("Sorry, de pagina is nu alleen gemaakt voor moderne browsers (Chrome, bij voorkeur).");
	} else {
		let expiration = localStorage.getItem("token_expiration");
		if (expiration) {
			if (+new Date(expiration) < +new Date()) {
				document.write("De sessie is verlopen! <a href='" + auth_url + "'>Inloggen</a>");
			} else {
				main();
			}
		} else {
			document.write('Welkom! <a href="' + auth_url + '">Klik hier om je aan te melden via Spotify</a>');
		}
	}
}

function main(){
	access_token = localStorage.getItem("access_token");

	document.write("<style>*{font-family: Roboto, Arial;}</style>Je bent ingelogd! <button id='signout'>Uitloggen</button><br><br><button id='load'>Gegevens downloaden</button><br><ul id='tracks'></ul><br><ul id='artists'></ul>");
	document.getElementById('signout').addEventListener('click', signOut);
	document.getElementById('load').addEventListener('click', loadData);
}

function loadData(){
	xml = new XMLHttpRequest();
	xml.open('GET', 'https://api.spotify.com/v1/me/top/tracks');

	xml.onreadystatechange = function(){
		if(this.readyState == XMLHttpRequest.DONE && this.status === 200){
			result = JSON.parse(this.response);
			if(!result || !('items' in result)){
				alert("Er ging iets mis!");
			}else{
				let items = result.items;
				let html = '<h1>Beste nummers</h1>';
				for (let i = 0; i < items.length; i++) {
					const el = items[i];
					html += '<li>' + el.artists[0].name + " - " + el.name + '</li>'
				}
				document.getElementById("tracks").innerHTML = html;
			}
		}
	}

	xml.setRequestHeader('Authorization', 'Bearer ' + access_token)

	xml.send();

	xml = new XMLHttpRequest();
	xml.open('GET', 'https://api.spotify.com/v1/me/top/artists');

	xml.onreadystatechange = function(){
		if(this.readyState == XMLHttpRequest.DONE && this.status === 200){
			result = JSON.parse(this.response);
			if(!result || !('items' in result)){
				alert("Er ging iets mis!");
			}else{
				let items = result.items;
				let html = '<h1>Beste artiesten</h1>';
				for (let i = 0; i < items.length; i++) {
					const el = items[i];
					html += '<li>' + el.name + '</li>'
				}
				document.getElementById("artists").innerHTML = html;
			}
		}
	}

	xml.setRequestHeader('Authorization', 'Bearer ' + access_token)

	xml.send();
}

function signOut(){
	localStorage.removeItem('token_expiration');
	localStorage.removeItem('access_token');
	location.reload();
}