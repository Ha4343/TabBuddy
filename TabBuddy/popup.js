document.addEventListener("DOMContentLoaded", () => {
    const tabCount = document.getElementById("tabCount");
    const closeTabs = document.getElementById("closeTabs");
    const groupTabs = document.getElementById("groupTabs");
    const saveTabs = document.getElementById("saveTabs");
    const restoreTabs = document.getElementById("restoreTabs");
    const closeDuplicates = document.getElementById("closeDuplicates");
    const darkMode = document.getElementById("darkMode");

    function updateTabCount() {
        chrome.tabs.query({}, (tabs) => {
            tabCount.textContent = tabs.length;
            if (tabs.length > 10) {
                alert("⚠️ Too many tabs open! Consider closing some.");
            }
        });
    }

    function closeLeastUsedTabs() {
        chrome.tabs.query({ active: false }, (tabs) => {
            if (tabs.length > 3) {
                chrome.tabs.remove(tabs[0].id);
                updateTabCount();
            }
        });
    }

    function groupTabsByDomain() {
        chrome.tabs.query({}, (tabs) => {
            let groups = {};
            tabs.forEach(tab => {
                let domain = new URL(tab.url).hostname;
                if (!groups[domain]) groups[domain] = [];
                groups[domain].push(tab.id);
            });

            for (let domain in groups) {
                if (groups[domain].length > 1) {
                    chrome.tabs.group({ tabIds: groups[domain] });
                }
            }
            alert("✅ Tabs grouped by website!");
        });
    }

    function saveTabsForLater() {
        chrome.tabs.query({}, (tabs) => {
            let urls = tabs.map(tab => tab.url);
            chrome.storage.local.set({ savedTabs: urls }, () => {
                alert("✅ Tabs saved! You can restore them later.");
            });
        });
    }

    function restoreSavedTabs() {
        chrome.storage.local.get("savedTabs", (data) => {
            if (data.savedTabs) {
                data.savedTabs.forEach(url => {
                    chrome.tabs.create({ url });
                });
            } else {
                alert("⚠️ No saved tabs found!");
            }
        });
    }

    function closeDuplicateTabs() {
        chrome.tabs.query({}, (tabs) => {
            let seenUrls = {};
            let duplicates = [];

            tabs.forEach(tab => {
                if (seenUrls[tab.url]) {
                    duplicates.push(tab.id);
                } else {
                    seenUrls[tab.url] = true;
                }
            });

            if (duplicates.length > 0) {
                chrome.tabs.remove(duplicates, () => {
                    alert(`✅ Closed ${duplicates.length} duplicate tabs!`);
                });
            } else {
                alert("✅ No duplicate tabs found!");
            }
        });
    }

    function toggleDarkMode() {
        let body = document.body;
        body.classList.toggle("dark-mode");
        chrome.storage.local.set({ darkMode: body.classList.contains("dark-mode") });
    }

    chrome.storage.local.get("darkMode", (data) => {
        if (data.darkMode) {
            document.body.classList.add("dark-mode");
        }
    });

    closeTabs.addEventListener("click", closeLeastUsedTabs);
    groupTabs.addEventListener("click", groupTabsByDomain);
    saveTabs.addEventListener("click", saveTabsForLater);
    restoreTabs.addEventListener("click", restoreSavedTabs);
    closeDuplicates.addEventListener("click", closeDuplicateTabs);
    darkMode.addEventListener("click", toggleDarkMode);

    updateTabCount();
});
