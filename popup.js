chrome.runtime.onInstalled.addListener(function() {
    port = chrome.runtime.connect({name: "historyChannel"});
    port.postMessage({request: "getHistory"});
    port.onMessage.addListener(function(message, sender, sendResponse) {
        list = document.getElementById("historyList");
        for (entry in message) {
            li = document.createElement('li');
            li.innerHTML = '<a href=\"' + entry.url + '\">' + entry.title + '</a>';
            list.appendChild(li);
        }
    });
});
