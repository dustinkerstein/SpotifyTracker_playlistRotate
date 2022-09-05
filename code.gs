const url = ''; // Replace with the test dev URL after deploying as a web app

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

function getURL() {
  return url;
}