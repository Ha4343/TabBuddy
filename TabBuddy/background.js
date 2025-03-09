chrome.runtime.onInstalled.addListener(() => {
    console.log("🚀 TabBuddy is running!");
});

function updateTabCount() {
    chrome.tabs.query({}, (tabs) => {
        chrome.storage.local.set({ openTabs: tabs.length });
    });
}

chrome.tabs.onUpdated.addListener(updateTabCount);
chrome.tabs.onRemoved.addListener(updateTabCount);

// Prevent accidental closing of pinned tabs
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.tabs.get(tabId, (tab) => {
        if (tab && tab.pinned) {
            chrome.tabs.create({ url: tab.url, pinned: true });
        }
    });
});
