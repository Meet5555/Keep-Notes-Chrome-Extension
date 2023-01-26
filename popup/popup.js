// Retrive last note from current website and show it inside the popup
chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
    let currentTabId = response.tabId.toString();
    let currentUrl = response.tabUrl;

    chrome.storage.sync.get(['savedNotes'], (res) => {
        let savedNotes = res.savedNotes;
        if (!savedNotes) {
            savedNotes = [];
        }
        if (savedNotes.length === 0) {
            document.getElementById("download-all-notes").classList.add("hide");
        }
        else {
            document.getElementById("download-all-notes").classList.remove("hide");
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
        } else {
            showLastNote("Recent Note:", lastNote, timestamp);
            document.getElementById("download-notes").classList.remove("hide");
            readText(lastNote);
        }
    });
})

//When there is no notes on current website then this will show the emptyNotes message
function emptyNotes() {
    let noteContainer = document.getElementById("note-container");
    let h3 = document.createElement("h3");
    h3.textContent = `You have not saved any note on this website, Please select some text to add note!`
    noteContainer.appendChild(h3);
}

//This function show the recent note on the current website which is saved by the user
function showLastNote(heading, note, timestamp) {
    let noteContainer = document.getElementById("note-container");
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

//Read text 
function readText(note) {
    let noteContainer = document.getElementById("note-container");
    let readBtn = document.createElement("button");
    readBtn.id = "read-btn";
    readBtn.innerHTML = '<img src="../play.png">';
    noteContainer.appendChild(readBtn);
    readBtn.addEventListener("click", () => {
        if (readBtn.innerHTML === '<img src="../play.png">') {
            chrome.runtime.sendMessage({ type: "readText", text: note });
            readBtn.innerHTML = '<img src="../stop.png">'
        } else if (readBtn.innerHTML === '<img src="../stop.png">') {
            chrome.runtime.sendMessage({ type: "stopReading" });
            readBtn.innerHTML = '<img src="../play.png">';
        }
    })
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.type === "readingEnd") {
            readBtn.innerHTML = '<img src="../play.png">';
        }
    });
}
//download notes of current webpage in txt file
let downloadButton = document.getElementById("download-notes");
downloadButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
        let currentTabId = response.tabId.toString();
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
            let blob = new Blob([notesText], { type: 'text/plain' });
            let url = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = `${hostname}-notes.txt`;
            a.click();
        });
    });
});


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
            notesByWebsite[note.websiteURL] += note.text + "\n";
        });
        let notesText = "";
        for (let url in notesByWebsite) {
            notesText += "Notes on\t " + url + "\t are --> \n\n" + notesByWebsite[url] + "\n\n";
        }
        let notesBlob = new Blob([notesText], { type: "text/plain;charset=utf-8" });
        let downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(notesBlob);
        downloadLink.download = "all-notes.txt";
        downloadLink.click();
    });
}
