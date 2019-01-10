let port = chrome.runtime.connect({name: "historyChannel"});
chrome.tabs.query({"active": true}, function(tabs) {
    port.postMessage({"request": tabs[0].id});
});
port.onMessage.addListener(function(message, sender, sendResponse) {
    console.log(message);
    console.log(sender);
    console.log(sendResponse);
    let list = document.getElementById("historyList");
    for (entry in message.new_history) {
        li = document.createElement('li');
        li.innerHTML = '<a href=\"' + entry.url + '\">' + entry.title + '</a>';
        list.appendChild(li);
    }
});
console.log('loaded');
