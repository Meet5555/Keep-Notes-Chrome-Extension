window.onload = highlightText;

function highlightText() {

}

function clearSelection() {
    if (window.getSelection) { window.getSelection().removeAllRanges(); }
    else if (document.selection) { document.selection.empty(); }
}

let text;
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
            text = ""
        })
    }
})

document.addEventListener("mousedown", (e) => {
    let addNoteBtn = document.getElementById("add-note-btn");
    if (!text && addNoteBtn != null)
        addNoteBtn.remove();
})

// function createAddNoteButton(event) {
//     let addNoteBtn = document.createElement("button");
//     addNoteBtn.id = "add-note-btn";
//     // addNoteBtn.innerHTML = '<img src="../icon.png" alt="ADD Note"/>';
//     addNoteBtn.innerHTML = "ADD Note";
//     addNoteBtn.addEventListener("click", () => {
//         let text = window.getSelection().toString().trim();

//         chrome.storage.sync.get("savedNotes", function (result) {
//             let savedNotes = result.savedNotes;
//             if (!Array.isArray(savedNotes)) {
//                 savedNotes = [];
//             }
//             let selection = window.getSelection();
//             let range = selection.getRangeAt(0);
//             let startContainer = range.startContainer;
//             let startOffset = range.startOffset;
//             let endContainer = range.endContainer;
//             let endOffset = range.endOffset;
//             let websiteURL = window.location.href;
//             savedNotes.push({
//                 [websiteURL]: text,
//                 startContainer: startContainer,
//                 startOffset: startOffset,
//                 endContainer: endContainer,
//                 endOffset: endOffset
//             });
//             chrome.storage.sync.set({ savedNotes: savedNotes });
//             console.log(savedNotes);
//             chrome.runtime.sendMessage({ type: "noteSaved" });
//             highlightText();
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


// This is working for the simple notes and url saving without highlight

function createAddNoteButton(event) {
    let addNoteBtn = document.createElement("button");
    addNoteBtn.id = "add-note-btn";
    // addNoteBtn.innerHTML = '<img src="../icon.png" alt="ADD Note"/>';
    addNoteBtn.innerHTML = "ADD Note";
    addNoteBtn.addEventListener("mousedown", () => {
        let text = window.getSelection().toString().trim();
        chrome.storage.sync.get(['savedNotes'], (res) => {
            let savedNotes = res.savedNotes;
            if (!Array.isArray(savedNotes)) {
                savedNotes = [];
            }
            // Get the current website URL
            let websiteURL = window.location.href;
            // Add the website URL and selection text to the savedNotes array
            savedNotes.push({ [websiteURL]: text });
            chrome.storage.sync.set({ 'savedNotes': savedNotes });
            console.log("clicked");
            chrome.runtime.sendMessage({ type: "noteSaved" });
            highlightText();
            clearSelection();
            addNoteBtn.remove();
            // console.log(savedNotes);
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