class HistoryNode {
    constructor(url, title, previousNode) {
        this.url = url;
        this.previousNode = previousNode;
        this.title = title
        this.nextNodes = new Array();
    }

    addBrowsedPage(newPageNode) {
        this.nextNodes.push(newPageNode);
    }

    hasBranches() {
        return this.nextNodes.length > 1;
    }

    getBranches() {
        return this.nextNodes;
    }

    getPrevious() {
        return this.previousNode;
    }

    getInfo() {
        return this.title + " - " + this.url;
    }
}

class HistoryTree {
    constructor(url, title) {
        this.root = new HistoryNode(url, title, null);
        this.current = this.root;
    }
    onNavigateToNewPage(url, title) {
        let newNode = new HistoryNode(url, title, this.current);
        this.current.addBrowsedPage(newNode);
        this.current = newNode;
    }
    onBackPressed() {
        this.current = this.current.getPrevious();
    }

    getHistory() {
        let getHistoryHelper = function(node, currentTree) {
            currentTree.push(node);
            if (node.nextNodes.length == 0) {
                return currentTree;
            }
            if (node.nextNodes.length == 1) {
                return currentTree.push(getHistoryHelper(node.nextNodes[0], currentTree));
            }
            branches = new Array();
            for (nextNode in node.nextNodes()) {
                branches.push(nextNode);
                branches.push(getHistoryHelper(nextNode, currentTree));
            }
            currentTree.push(branches);
            return currentTree;
        }
        return getHistoryHelper(this.root, new Array());
    }
}
let history = new Map();

chrome.runtime.onConnect.addListener(function(port) {
    console.log('adding listener');
    port.onMessage.addListener(function(message) {
        console.log(message);
        console.log("sending history message");
        port.postMessage({"new_history": history.get(message.request).getHistory()});
    });
});

chrome.tabs.onCreated.addListener(function(changeInfo) {
        if (history == null) {
            console.log('history is NOT SET');
        } else if (history.get(changeInfo.id) == null) {
            history.set(changeInfo.id, new HistoryTree(changeInfo.title, changeInfo.url));
        }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (history == null) {
        console.log('HISTORY NOT SET ON UPDATE');
        return;
    }
    if (tab.status != "complete") {
        return;
    }

    let relevantHistoryTab = history.get(tabId);
    console.log('onUpated history ' + relevantHistoryTab);
    if (relevantHistoryTab == null) {
        history.set(tabId, new HistoryTree(changeInfo.title, changeInfo.url));
    } else {
            relevantHistoryTab.onNavigateToNewPage(changeInfo.title, changeInfo.url);
    }
        //else {
        //    let history = new Map([[tabId, new HistoryTree(changeInfo.title, changeInfo.url)]]);
         //   chrome.storage.local.set({history: history}, function() {
         //       console.log('history is set to ' + history);
          //  });
        //}
    });
