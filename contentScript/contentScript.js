window.onload = highlightText();

function highlightText() {
    // chrome.storage.sync.get("savedNotes", function (result) {
    //     let savedNotes = result.savedNotes;
    //     if (!Array.isArray(savedNotes)) {
    //         return;
    //     }
    //     for (let note of savedNotes) {
    //         if (note.websiteURL === window.location.href) {
    //             let highlightedText = "<span class='highlight'>" + note.text + "</span>";
    //             console.log(highlightedText);
    //             document.body.innerHTML = document.body.innerHTML.replace(new RegExp(note.text, "g"), highlightedText);
    //         }
    //     }
    // });
}

let text = "";
document.addEventListener("mouseup", (event) => {
    text = window.getSelection().toString().trim();
    let addNoteBtn = document.getElementById("add-note-btn");
    if (!text) {
        if (addNoteBtn) {
            document.body.removeChild(addNoteBtn);
            return;
        }
    }
    else {
        chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
            let tabId = response.tabId.toString();
            if (!addNoteBtn) {
                let btn = createAddNoteButton(event);
                document.body.appendChild(btn);
            }
            text = "";
        })
    }
})

document.addEventListener("mousedown", (event) => {
    let addNoteBtn = document.getElementById("add-note-btn");
    if (!text && addNoteBtn != null) {
        if (event.target.id != "add-note-btn" && event.target.id != "highlighter") {
            document.body.removeChild(addNoteBtn);
        }
    }
})

function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
    else if (document.selection) {
        document.selection.empty();
    }
}

function createAddNoteButton(event) {
    let addNoteBtn = document.createElement("button");
    addNoteBtn.id = "add-note-btn";
    let span = document.createElement("span");
    span.className = "fas fa-highlighter";
    span.id = "highlighter"
    addNoteBtn.appendChild(span);
    // addNoteBtn.innerHTML = "ADD Note";
    addNoteBtn.addEventListener("click", () => {
        let text = window.getSelection().toString().trim();
        chrome.storage.sync.get("savedNotes", function (result) {
            let savedNotes = result.savedNotes;
            if (!Array.isArray(savedNotes)) {
                savedNotes = [];
            }


            let selection = window.getSelection();
            let range = selection.getRangeAt(0);
            let startContainer = range.startContainer.parentElement;
            let startOffset = range.startOffset;
            let endContainer = range.endContainer.parentElement;
            let endOffset = range.endOffset;


            let websiteURL = window.location.href;
            let timestamp = new Date().toLocaleString();
            savedNotes.push({
                websiteURL: websiteURL,
                text: text,


                startContainer: startContainer,
                startOffset: startOffset,
                endContainer: endContainer,
                endOffset: endOffset,


                timestamp: timestamp
            });
            chrome.storage.sync.set({ savedNotes: savedNotes });
            console.log(savedNotes);
            chrome.runtime.sendMessage({ type: "noteSaved" });
            clearSelection();
            document.body.removeChild(addNoteBtn);
            highlightText();
            floatingWindow();
        });
    })
    // Get the position of the selected text
    let x = event.pageX + 5;
    let y = event.pageY;
    // Position the button next to the selected text
    addNoteBtn.style.left = x + "px";
    addNoteBtn.style.top = y + "px";
    return addNoteBtn;
}

// all notes in floatingWindow
floatingWindow();
function floatingWindow() {
    let notesContainer = document.getElementById("notes-container");
    if (notesContainer) {
        document.body.removeChild(notesContainer);
    }
    chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
        let currentUrl = response.tabUrl;
        chrome.storage.sync.get(['savedNotes'], (res) => {
            let savedNotes = res.savedNotes;
            console.log(savedNotes);
            if (!Array.isArray(savedNotes)) {
                return;
            }
            let notesContainer = document.createElement("div");
            notesContainer.id = "notes-container";
            notesContainer.className = "hide";
            let heading = document.createElement("h1");
            heading.id = "heading";
            heading.textContent = "You have not saved any note on this website, Please select some text to add note!";
            notesContainer.appendChild(heading);
            let closeFloatingWindow = document.createElement("button");
            closeFloatingWindow.innerHTML = "X";
            closeFloatingWindow.id = "close-floating-window";
            closeFloatingWindow.addEventListener("click", () => {
                notesContainer.classList.toggle("hide");
            })
            notesContainer.appendChild(closeFloatingWindow);
            let container = document.createElement("div");
            container.id = "container";
            notesContainer.appendChild(container)
            // Iterate through the savedNotes array
            for (let obj of savedNotes) {
                // Check if the website URL of the current tab matches the key of the object in the array
                if (obj.websiteURL === currentUrl) {
                    heading.textContent = "Your Notes on this website";
                    // Retrieve the value (the selection text) associated with that key
                    let p = document.createElement("p");
                    let removeNote = document.createElement("button");
                    removeNote.innerHTML = "X";
                    removeNote.className = "removeNote";
                    removeNote.id = obj.timestamp;
                    removeNote.addEventListener("click", (e) => {
                        if (confirm("Are you sure you want to delete this note?")) {
                            chrome.storage.sync.get(['savedNotes'], (result) => {
                                let oldArray = result.savedNotes;
                                let newNotes = oldArray.filter(note => note.timestamp !== e.target.id);
                                chrome.storage.sync.set({ "savedNotes": newNotes });
                                floatingWindow();
                            })
                        }
                    });
                    p.className = "notes";
                    p.textContent = obj.text;
                    p.appendChild(removeNote);
                    container.appendChild(p);
                }
            }
            document.body.appendChild(notesContainer);
        });
    });
}

let viewPageNotes = document.createElement("div");
viewPageNotes.className = "viewPageNotes";
viewPageNotes.innerHTML = "<span>View Page Notes</span>"
document.querySelector("body").appendChild(viewPageNotes);

viewPageNotes.addEventListener("click", () => {
    // floatingWindow();
    let notesContainer = document.getElementById("notes-container");
    notesContainer.classList.toggle("hide");
})


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "callFloatingWindow") {
        console.log('callFloatingWindow');
        floatingWindow();
    }
});

var link = document.createElement("link");
link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
link.type = "text/css";
link.rel = "stylesheet";
document.head.appendChild(link);
