// Si le message est "report_back" renvoie le DOM
function handleMessage(request, sender, sendResponse) {
  //console.log(`content script sent a message: ${request.content}`);
  if (request.text && (request.text == "report_back")) {
    sendResponse({ response: document.body.outerHTML });
  }
}

window.addEventListener('load', function () {
  // Listener - Réception d'un message
  browser.runtime.onMessage.addListener(handleMessage);
});
