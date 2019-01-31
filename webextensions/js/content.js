// Si le message est "report_back" renvoie le DOM
function handleMessage(request, sender, sendResponse) {
  if (request.text && (request.text == "report_back")) {
    sendResponse(document.body.outerHTML);
  }
}

window.addEventListener('load', function () {
  // Listener - Réception d'un message
  browser.runtime.onMessage.addListener(handleMessage);
});
