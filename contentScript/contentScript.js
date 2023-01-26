// window.onload = highlightText;

// function highlightText() {

// }

let text = "";
document.addEventListener("mouseup", (event) => {
    text = window.getSelection().toString().trim();
    let addNoteBtn = document.getElementById("add-note-btn");
    if (!text) {
        if (addNoteBtn) {
            addNoteBtn.remove();
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

document.addEventListener("mousedown", () => {
    let addNoteBtn = document.getElementById("add-note-btn");
    if (!text && addNoteBtn != null) {
        addNoteBtn.remove();
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
            addNoteBtn.remove();
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









// This is working for the simple notes and url saving without highlight

// function createAddNoteButton(event) {
//     let addNoteBtn = document.createElement("button");
//     addNoteBtn.id = "add-note-btn";
//     // addNoteBtn.innerHTML = '<img src="../icon.png" alt="ADD Note"/>';
//     addNoteBtn.innerHTML = "ADD Note";
//     addNoteBtn.addEventListener("click", () => {
//         let text = window.getSelection().toString().trim();
//         chrome.storage.sync.get(['savedNotes'], (res) => {
//             let savedNotes = res.savedNotes;
//             if (!Array.isArray(savedNotes)) {
//                 savedNotes = [];
//             }
//             // Get the current website URL
//             let websiteURL = window.location.href;
//             // Add the website URL and selection text to the savedNotes array
//             savedNotes.push({ [websiteURL]: text });
//             chrome.storage.sync.set({ 'savedNotes': savedNotes });
//             chrome.runtime.sendMessage({ type: "noteSaved" });
//             highlightText();
//             // console.log(savedNotes);
//         });
//     })
//     // Get the position of the selected text
//     let x = event.pageX + 5;
//     let y = event.pageY;
//     // Position the button next to the selected text
//     addNoteBtn.style.left = x + "px";
//     addNoteBtn.style.top = y + "px";
//     return addNoteBtn;
// }

