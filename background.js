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
        //Create alarm for current time to send notification
        chrome.alarms.create("noteSaved", {
            when: Date.now()
        });
        // Listen for the alarm to be triggered
        chrome.alarms.onAlarm.addListener(function (alarm) {
            count++;
            if (alarm.name === "noteSaved" && count == 1) {
                this.registration.showNotification("Keep Notes", {
                    body: "Your notes have been added! Pls click on extension popup to view your notes.",
                    icon: "icon.png"
                })
            }
        });
    }
    else if (message.type === "readText") {
        let text = message.text;
        chrome.tts.speak(text, {
            onEvent: function (event) {
                if (event.type === 'end') {
                    chrome.runtime.sendMessage({ type: "readingEnd" });
                }
            }
        })
    }
    else if (message.type === "stopReading") {
        chrome.tts.stop();
    }
})