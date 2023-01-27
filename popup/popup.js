loadPopUp();
// Retrive last note saved on current website and show it inside the popup
function loadPopUp() {
    chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
        let currentUrl = response.tabUrl;
        chrome.storage.sync.get(['savedNotes'], (res) => {
            let savedNotes = res.savedNotes;
            if (!savedNotes) {
                savedNotes = [];
            }
            if (savedNotes.length === 0) {
                document.getElementById("download-all-notes").classList.add("hide");
                document.getElementById("delete-all-notes").classList.add("hide");
            }
            else {
                document.getElementById("download-all-notes").classList.remove("hide");
                document.getElementById("delete-all-notes").classList.remove("hide");
            }
            let lastNote = "";
            let timestamp = ""
            //Loop through savedNotes array with key of the object
            for (let obj of savedNotes) {
                // Check if the website URL of the current tab matches the key of the object in the array
                if (obj.websiteURL === currentUrl) {
                    lastNote = obj.text;
                    timestamp = obj.timestamp;
                }
            }
            if (lastNote === "") {
                emptyNotes();
                document.getElementById("download-notes").classList.add("hide");
                document.getElementById("delete-page-notes").classList.add("hide");
            } else {
                showLastNote("Recent Note:", lastNote, timestamp);
                document.getElementById("download-notes").classList.remove("hide");
                document.getElementById("delete-page-notes").classList.remove("hide");
                readText(lastNote);
            }
        });
    })
}

//When there is no notes on current website then this will show the emptyNotes message
function emptyNotes() {
    let noteContainer = document.getElementById("note-container");
    noteContainer.innerHTML = "";
    let h3 = document.createElement("h3");
    h3.textContent = `You have not saved any note on this website, Please select some text to add note!`
    noteContainer.appendChild(h3);
}

//This function show the recently saved note on the current website
function showLastNote(heading, note, timestamp) {
    let noteContainer = document.getElementById("note-container");
    noteContainer.innerHTML = "";
    let h3 = document.createElement("h3");
    h3.textContent = heading
    let p = document.createElement("p");
    p.textContent = note;
    let small = document.createElement("small");
    small.id = "timestamp";
    small.textContent = `saved on: ` + timestamp;
    p.appendChild(small);
    noteContainer.appendChild(h3);
    noteContainer.appendChild(p);
}

//Read text on clock of button and also stop reading
function readText(note) {
    let noteContainer = document.getElementById("note-container");
    let readBtn = document.createElement("button");
    readBtn.id = "read-btn";
    readBtn.innerHTML = '<img src="../images/play.png">';
    noteContainer.appendChild(readBtn);
    readBtn.addEventListener("click", () => {
        if (readBtn.innerHTML === '<img src="../images/play.png">') {
            chrome.runtime.sendMessage({ type: "readText", text: note });
            readBtn.innerHTML = '<img src="../images/stop.png">'
        } else if (readBtn.innerHTML === '<img src="../images/stop.png">') {
            chrome.runtime.sendMessage({ type: "stopReading" });
            readBtn.innerHTML = '<img src="../images/play.png">';
        }
    })
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type === "readingEnd") {
            readBtn.innerHTML = '<img src="../images/play.png">';
        }
    });
}

//download notes of current webpage in txt file
let downloadButton = document.getElementById("download-notes");
downloadButton.addEventListener("click", downloadNotes);

function downloadNotes() {
    chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
        let currentUrl = response.tabUrl;
        chrome.storage.sync.get(['savedNotes'], (res) => {
            let savedNotes = res.savedNotes;
            if (!Array.isArray(savedNotes)) {
                savedNotes = [];
            }
            // Iterate through the savedNotes array
            let notesText = "";
            for (let obj of savedNotes) {
                // Check if the website URL of the current tab matches the key of the object in the array
                if (obj.websiteURL === currentUrl) {
                    // Retrieve the value (the selection text) associated with that key
                    notesText += obj.text + "\n\n";
                }
            }
            // Extract the hostname from the currentUrl
            let hostname = new URL(currentUrl).hostname;
            //Create Blob object and then URL to download txt file
            let blob = new Blob([notesText], { type: 'text/plain' });
            let url = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = `${hostname}-notes.txt`;
            a.click();
        });
    });
}

//download all the notes from all website in txt file
let downloadAllButton = document.getElementById("download-all-notes");
downloadAllButton.addEventListener("click", downloadallNotes);

function downloadallNotes() {
    chrome.storage.sync.get(['savedNotes'], (res) => {
        let savedNotes = res.savedNotes;
        if (!Array.isArray(savedNotes)) {
            savedNotes = [];
        }
        let notesByWebsite = {};
        savedNotes.forEach(note => {
            if (!notesByWebsite[note.websiteURL]) {
                notesByWebsite[note.websiteURL] = "";
            }
            notesByWebsite[note.websiteURL] += note.text + "\n\n";
        });
        let notesText = "";
        for (let url in notesByWebsite) {
            notesText += "Notes on\t " + url + "\t are --> \n\n" + notesByWebsite[url] + "\n\n";
        }
        //Create Blob object and then URL to download txt file
        let notesBlob = new Blob([notesText], { type: "text/plain;charset=utf-8" });
        let downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(notesBlob);
        downloadLink.download = "all-notes.txt";
        downloadLink.click();
    });
}

// Deleting page notes
let deletePageNotes = document.getElementById("delete-page-notes");
chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
    let currentUrl = response.tabUrl;
    deletePageNotes.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all the notes of current webpage?")) {
            chrome.storage.sync.get(['savedNotes'], (res) => {
                let savedNotes = res.savedNotes;
                if (!Array.isArray(savedNotes)) {
                    savedNotes = [];
                }
                for (let i = 0; i < savedNotes.length; i++) {
                    if (savedNotes[i].websiteURL === currentUrl) {
                        let newNotes = savedNotes.filter(note => note.websiteURL !== currentUrl);
                        chrome.storage.sync.set({ "savedNotes": newNotes });
                    }
                }
            });
            // To change the content in floating window send message to content script
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "callFloatingWindow" });
            });
        }
    })
});

// Deleting all Notes
let deleteAllNotes = document.getElementById("delete-all-notes");
deleteAllNotes.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all the notes of all webpage?")) {
        chrome.storage.sync.get(['savedNotes'], (res) => {
            let savedNotes = res.savedNotes;
            if (!Array.isArray(savedNotes)) {
                savedNotes = [];
            }
            chrome.storage.sync.set({ "savedNotes": [] });
        });
        // To change the content in floating window send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "callFloatingWindow" });
        });
    }
})

// When change is storage i.e. deleting the notes then reload the popup body
chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (key in changes) {
        var storageChange = changes[key];
        loadPopUp();
    }
});

// Logic to show or hide View Page Notes button on click of button inside of popup
let showViewNote = document.getElementById("show-view-note");
showViewNote.addEventListener("click", () => {
    chrome.storage.sync.get("count", (res) => {
        let count = res.count;
        if (!count) {
            chrome.storage.sync.set({ count: 1 });
            document.getElementById("toggler").classList.add("toggler-right");
            document.getElementById("toggler").classList.remove("toggler-left");
            document.getElementById("show-view-note").style.backgroundColor = "#59f159";
        }
        if (count === 0) {
            chrome.storage.sync.set({ count: 1 });
        }
        else {
            chrome.storage.sync.set({ count: 0 });
            document.getElementById("toggler").classList.add("toggler-left");
            document.getElementById("toggler").classList.remove("toggler-right");
            document.getElementById("show-view-note").style.backgroundColor = "grey";
        }
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "showViewNote" });
        });
    })
})

chrome.storage.sync.get("count", (res) => {
    let count = res.count;
    if (count === 0) {
        document.getElementById("toggler").classList.add("toggler-left");
        document.getElementById("toggler").classList.remove("toggler-right");
        document.getElementById("show-view-note").style.backgroundColor = "grey";
    }
    else {
        document.getElementById("toggler").classList.add("toggler-right");
        document.getElementById("toggler").classList.remove("toggler-left");
        document.getElementById("show-view-note").style.backgroundColor = "#59f159";
    }
})