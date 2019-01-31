// Si le message est "report_back" renvoie le DOM
function handleMessage(request, sender, sendResponse) {
  if (request.text && (request.text == "report_back")) {
    sendResponse(document.body.outerHTML);
  }
}

window.addEventListener('load', function () {
  // Listener - Réception d'un message
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    handleMessage(msg, sender, sendResponse);
  });
});
