// window.onload = highlightText();

// Highlight stored notes
function highlightText(text) {
    let span = document.createElement("span");
    span.style.backgroundColor = "#59f159";
    if (text.rangeCount) {
        try {
            let range = text.getRangeAt(0).cloneRange();
            range.surroundContents(span);
            text.removeAllRanges();
            text.addRange(range);
        } catch (e) {
            console.log("can not highlight text because it contains some html tags inside it");
        }
    }
}

chrome.storage.sync.set({ savedNotes: [] });
let text = "";
// After selection this event is called and create the button to add a note
document.addEventListener("mouseup", (event) => {
    // store value of selected text inside text variable
    text = window.getSelection()
    if (text) {
        highlightText(text);
    }
    text = text.toString().trim();
    let addNoteBtn = document.getElementById("add-note-btn");
    // If not selected any text and add note button is there then remove it
    if (!text) {
        if (addNoteBtn) {
            document.body.removeChild(addNoteBtn);
            return;
        }
    }
    else {
        chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
            let tabId = response.tabId.toString();
            // Create add note button and append it to body
            if (!addNoteBtn) {
                let btn = createAddNoteButton(event);
                document.body.appendChild(btn);
            }
            text = "";
        })
    }
})

// This event is called whenever we start new selection without doing any changes in previous selection
document.addEventListener("mousedown", (event) => {
    let addNoteBtn = document.getElementById("add-note-btn");
    if (!text && addNoteBtn != null) {
        // if mouse click is not on the add not button then it is new selection started so remove add note button
        if (event.target.id != "add-note-btn" && event.target.id != "highlighter") {
            document.body.removeChild(addNoteBtn);
        }
    }
})

// To clear selection when note is added or any other changes
function clearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
    else if (document.selection) {
        document.selection.empty();
    }
}

// adding font-awesome css to head 
let link = document.createElement("link");
link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
link.type = "text/css";
link.rel = "stylesheet";
document.head.appendChild(link);

// creates add note button and position it according to selection and mouseup event
function createAddNoteButton(event) {
    let addNoteBtn = document.createElement("button");
    addNoteBtn.id = "add-note-btn";
    let span = document.createElement("span");
    span.className = "fas fa-highlighter"; // font awesome icon 
    span.id = "highlighter";
    addNoteBtn.appendChild(span);

    // on click of add note button note is added to the storage
    addNoteBtn.addEventListener("click", () => {
        let text = window.getSelection().toString().trim();
        chrome.storage.sync.get("savedNotes", function (result) {
            let savedNotes = result.savedNotes;
            if (!Array.isArray(savedNotes)) {
                savedNotes = [];
            }
            // let selection = window.getSelection();
            // let range = selection.getRangeAt(0);
            // let startContainer = range.startContainer.parentElement;
            // let startOffset = range.startOffset;
            // let endContainer = range.endContainer.parentElement;
            // let endOffset = range.endOffset;
            let websiteURL = window.location.href;
            let timestamp = new Date().toLocaleString();
            savedNotes.push({
                websiteURL: websiteURL,
                text: text,
                timestamp: timestamp
            });
            chrome.storage.sync.set({ savedNotes: savedNotes });

            chrome.runtime.sendMessage({ type: "noteSaved" });
            // some function to load the floating window and highlight the text
            document.body.removeChild(addNoteBtn);
            clearSelection();
            // highlightText();
            floatingWindow();
        });
    })
    // Get the position of the selected text
    let x = event.pageX + 5;
    let y = event.pageY - 20;
    // Position the button next to the selected text
    addNoteBtn.style.left = x + "px";
    addNoteBtn.style.top = y + "px";
    return addNoteBtn;
}


let viewPageNotes = document.createElement("div");
viewPageNotes.className = "viewPageNotes";
viewPageNotes.innerHTML = "<span>View Page Notes</span>"
document.querySelector("body").appendChild(viewPageNotes);
showViewNoteBtn();
viewPageNotes.addEventListener("click", () => {
    // floatingWindow();
    let notesContainer = document.getElementById("notes-container");
    notesContainer.classList.toggle("hide");
})

// show all notes in floatingWindow when view page not button is clicked
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
                    let small = document.createElement("small");
                    small.className = "noteTimestamp";
                    small.textContent = `saved on: ` + obj.timestamp;
                    p.appendChild(small);
                    p.appendChild(removeNote);
                    container.appendChild(p);
                }
            }
            document.body.appendChild(notesContainer);
        });
    });
}



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "callFloatingWindow") {
        floatingWindow();
    }
    else if (message.type === "showViewNote") {
        showViewNoteBtn();
    }
});

function showViewNoteBtn() {
    chrome.storage.sync.get("count", (res) => {
        let count = res.count;
        if (count === 0) {
            document.querySelector(".viewPageNotes").style.display = "none";
        }
        else {
            document.querySelector(".viewPageNotes").style.display = "block";
        }
    })
}