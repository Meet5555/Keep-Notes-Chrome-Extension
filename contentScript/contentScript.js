// window.onload = highlightText;

// function highlightText() {

// }

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
    console.log(addNoteBtn);
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
    // addNoteBtn.innerHTML = '<img src="../icon.png" alt="ADD Note"/>';
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
            let startContainer = range.startContainer.parentElement.innerHTML;
            let startOffset = range.startOffset;
            let endContainer = range.endContainer.parentElement.innerHTML;
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
            // highlightText();
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
