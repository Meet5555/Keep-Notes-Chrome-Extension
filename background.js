chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let count = 0;
    if (message.type === "getTabId") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            let currentTab = tabs[0];
            let tabId = currentTab.id;
            let tabUrl = currentTab.url;
            sendResponse({ tabId: tabId, tabUrl: tabUrl });
        });
        return true;
    }
    else if (message.type === "noteSaved") {
        chrome.alarms.get("noteSaved", (alarm) => {
            if (alarm) {
                chrome.alarms.clear("noteSaved", () => {
                    console.log("Cleared");
                });
            }
            chrome.alarms.create("noteSaved", {
                when: Date.now()
            });
        })
        // Listen for the alarm to be triggered
        chrome.alarms.onAlarm.addListener(function (alarm) {
            count++;
            if (alarm.name === "noteSaved" && count == 1) {
                this.registration.showNotification("Keep Notes", {
                    body: "Your notes have been added! . Pls click on  extension popup to view  your notes.",
                    icon: "icon.png"
                })
            }
        });
    }
})