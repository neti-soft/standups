(function () {

    // Bootstraps extension. Called when the user clicks on the browser action.
    chrome.browserAction.onClicked.addListener(function (tab) {

        //get current tab and send bootstrap event
        chrome.tabs.query({ active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { cmd: "bootstrap" });
        });
    });

    chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {

        // content script asks for index.html
        if (request.cmd == "read_file") {
            $.ajax({
                url: chrome.extension.getURL(request.file),
                dataType: "html",
                success: sendResponse
            });
        }
    });
})()