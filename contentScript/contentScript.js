window.onload = highlightText();

function highlightText() {
    chrome.storage.sync.get("savedNotes", function (result) {
        let savedNotes = result.savedNotes;
        if (!Array.isArray(savedNotes)) {
            return;
        }
        for (let note of savedNotes) {
            if (note.websiteURL === window.location.href) {
                let highlightedText = "<span class='highlight'>" + note.text + "</span>";
                console.log(highlightedText);
                document.body.innerHTML = document.body.innerHTML.replace(new RegExp(note.text, "g"), highlightedText);
            }
        }
    });
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
        if (event.target.id != "add-note-btn") {
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
    // addNoteBtn.innerHTML = '<img src="../edit.png" alt="ADD Note">';
    addNoteBtn.innerHTML = "ADD Note";
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


// all notes in aside
// chrome.runtime.sendMessage({ type: "getTabId" }, (response) => {
//     let currentUrl = response.tabUrl;
//     chrome.storage.sync.get(['savedNotes'], (res) => {
//         let savedNotes = res.savedNotes;
//         console.log(savedNotes);
//         if (!Array.isArray(savedNotes)) {
//             return;
//         }
//         let notesContainer = document.createElement("div");
//         notesContainer.id = "notes-container";
//         let heading = document.createElement("h1");
//         heading.id = "heading";
//         heading.textContent = "Your Notes on this website";
//         notesContainer.appendChild(heading)
//         // Iterate through the savedNotes array
//         for (let obj of savedNotes) {
//             // Check if the website URL of the current tab matches the key of the object in the array
//             if (obj.websiteURL === currentUrl) {
//                 // Retrieve the value (the selection text) associated with that key
//                 // notesText.push(obj.text);
//                 let p = document.createElement("p");
//                 p.className = "notes";
//                 p.textContent = obj.text;
//                 notesContainer.appendChild(p);
//             }
//         }
//         document.body.appendChild(notesContainer);
//     });
// });
