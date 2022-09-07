const numberSongsToPlay = 2; // Set to the number of songs you'd like to play from each playlist
const playlistIDs = ['','','']; // Replace with the playlist IDs you'd like to rotate
const clientID = ''; // Replace with clientID found on https://developer.spotify.com/dashboard/applications/
const clientSecret = ''; // Replace with clientSecret found on https://developer.spotify.com/dashboard/applications/
const execURL = ''; // Replace with the test dev URL after deploying as a web app

function doGet(e) {
  Logger.log(e);
  if (JSON.stringify(e).includes("callback")) {
    const callbackTemplate = HtmlService.createTemplateFromFile("callback"); 
    const callbackHtml = callbackTemplate.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    callbackHtml.setTitle("Spotify Playlist Rotate");
    callbackHtml.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    return callbackHtml;
  } else {
    const indexTemplate = HtmlService.createTemplateFromFile("index"); 
    const indexHtml = indexTemplate.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    indexHtml.setTitle("Spotify Playlist Rotate");
    indexHtml.addMetaTag('viewport', 'width=device-width, initial-scale=1');
    return indexHtml;
  }
}

function getData() {
  const data = {};
  data.playlistIDs = playlistIDs;
  data.execURL = execURL;
  data.numberSongsToPlay = numberSongsToPlay;
  data.clientID = clientID;
  data.clientSecret = clientSecret;
  return data;
}
