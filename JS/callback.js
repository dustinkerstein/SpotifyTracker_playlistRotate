	onload = function(){
		url = location.href;
		at = (url.split("access_token=")[1]||"").split("&")[0];
		ei = (url.split("expires_in=")[1]||"").split("&")[0];
		if(at && ei){
			if('localStorage' in window){
				localStorage.setItem("token_expiration", "" + new Date(+new Date() + (+ei)*1000));
				localStorage.setItem("access_token", at);
				location = location.href.split("/SpotifyTracker").length > 1 ? "../SpotifyTracker/" : "../"
			}else{
				erreur();
			}
		}else{
			erreur();
		}
	}

	function erreur(){
		document.write("Something went wrong. <a href='../SpotifyTracker/'>Go home</a>");
	}