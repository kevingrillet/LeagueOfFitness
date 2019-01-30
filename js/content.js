chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text && (msg.text == "report_back")) {
    sendResponse(document.body.outerHTML);
  }
});