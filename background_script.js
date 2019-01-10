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
        getHistoryHelper = function(node, currentTree) {
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

chrome.runtime.onConnect.addListener(function(port) {
    console.log('adding listener');
    port.onMessage.addListener(function(message) {
        chrome.storage.sync.get('history', function(result) {
        port.postMessage(result.history.getHistory());
    });
    });
});

chrome.tabs.onCreated.addListener(function(changeInfo) {
    history = new HistoryTree(changeInfo.title, changeInfo.url);
    chrome.storage.sync.set({'history': history}, function() {
        console.log('history is set to ' + history);
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    chrome.storage.sync.get('history', function(result) {
        console.log('onUpated history ' + result.history);
        if (result.history == null) {
            result.history = new HistoryTree(changeInfo.title, changeInfo.url);
        } else {
        result.history.onNavigateToNewPage(changeInfo.title, changeInfo.url);
        }
    });
});
