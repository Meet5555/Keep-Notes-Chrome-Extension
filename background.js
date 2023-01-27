chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let count = 0;
    if (message.type === "getTabId") {
        // Return current website's tab ID and URL
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
                // Give user notification that note is saved
                this.registration.showNotification("Keep Notes", {
                    body: "Your notes have been added! Pls click on extension popup to view your notes.",
                    icon: "/images/icon.png"
                })
            }
        });
    }
    else if (message.type === "readText") {
        // Read the text recived in message using chrome tts API
        let text = message.text;
        chrome.tts.speak(text, {
            onEvent: function (event) {
                if (event.type === 'end') {
                    // When reading of text ends send the message to change play or stop button in popup body
                    chrome.runtime.sendMessage({ type: "readingEnd" });
                }
            }
        })
    }
    // stop the reading when stop button is clicked inside the popup
    else if (message.type === "stopReading") {
        chrome.tts.stop();
    }
})