/* script.js
   Full typing engine:
   - Loads exercise from URL (?exercise=...)
   - Splits into 10 dynamic chunks
   - Timer (10 minutes default)
   - Input handling (navigate chunks with Enter/ArrowDown, back with ArrowUp)
   - Backspace counting
   - Full highlightErrors engine (handles missing/extra/merged/space/skipped)
   - PSSSB-style result calculation (gross/net chars, WPM, accuracy)
   - Result UI updates and saved test history (localStorage)
   - Defensive checks for missing DOM elements
*/
// Disable right click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Disable keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Disable: F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["U","S","C","V","X","A","P"].includes(e.key.toUpperCase()))
    ) {
        e.preventDefault();
        return false;
    }
});

// Disable copy / paste / cut
["copy", "paste", "cut"].forEach(evt => {
    document.addEventListener(evt, e => e.preventDefault());
});
// -------------------- Helper: Load paragraph from URL param --------------------

 // ensure previous/next by keyboard: PageUp/PageDown
  document.addEventListener('keydown', (e) => {

    if (e.code === 'PageDown' || e.key === 'PageDown') { e.preventDefault(); if (currentChunkIndex < chunks.length-1) { currentChunkIndex++; renderChunk(); } }
    if (e.code === 'PageUp' || e.key === 'PageUp') { e.preventDefault(); if (currentChunkIndex > 0) { currentChunkIndex--; renderChunk(); }
	}
  });
      
document.getElementById('typing-input').addEventListener('keydown', function(e) {
    if (e.key === "Tab") {
        e.preventDefault();
    }
});
// Disable right click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// Disable keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Disable: F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ["U","S","C","V","X","A","P"].includes(e.key.toUpperCase()))
    ) {
        e.preventDefault();
        return false;
    }
});

// Disable copy / paste / cut
["copy", "paste", "cut"].forEach(evt => {
    document.addEventListener(evt, e => e.preventDefault());
});


async function loadTestParagraph() {
  try {
    // ✅ First try to load from localStorage (safest path)
    const savedText = localStorage.getItem("selectedExerciseText");
    if (savedText) {
      localStorage.removeItem("selectedExerciseText");
  //   localStorage.removeItem("selectedExerciseLanguage");
      return savedText;
    }

    // ✅ Otherwise, load from URL (?exercise=...)
    const urlParams = new URLSearchParams(window.location.search);
    const encodedExercise = urlParams.get("exercise");

    if (encodedExercise) {
  try {
    // Safely decode URI component
    let decoded = decodeURIComponent(encodedExercise);

    // Normalize HTML entities to actual characters
    decoded = decoded
      .replace(/&quot;|&#34;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, "&");

    // Handle over-escaped double quotes (e.g., \" or \')
    decoded = decoded
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");

    return decoded.trim();
  } catch (decodeError) {
    console.warn("⚠️ Decode error, returning raw exercise text:", decodeError);
    let fallback = encodedExercise
      .replace(/&quot;|&#34;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");
    return fallback.trim();
  }
}


    console.warn("No exercise found.");
    return "";
  } catch (err) {
    console.error("Error loading exercise:", err);
    return "";
  }
}



// -------------------- Global state (from your engine) --------------------
let fullParagraph = "";
let words = [];
let chunkSize = 0;
window.paragraphs = [];
window.state = {
    currentParagraphIndex: 0,
    paragraph: "",
    defaultWords: [],
    typedWords: [],
    startTime: null,
    totalTime: 600, // 10 minutes default
    isTestRunning: false,
    totalTypedInput: "|",
    backspaceCount: 0
};

// Safe DOM helper
function $(id) { return document.getElementById(id); }
// -------------------- Initialize test and create chunks --------------------
async function initializeTest() {
    fullParagraph = await loadTestParagraph();
    // If no paragraph provided, keep existing text in DOM (useful for testing)
    if (!fullParagraph || fullParagraph.trim().length === 0) {
        // If paragraph element exists and contains text, use that
        const paragraphEl = $("paragraph");
        if (paragraphEl && paragraphEl.textContent.trim().length > 0) {
            fullParagraph = paragraphEl.textContent.trim();
        } else {
            fullParagraph = ""; // fallback empty
        }
    }

    // Normalize whitespace & trim
    fullParagraph = fullParagraph.replace(/\s+/g, " ").trim();
	fullParagraph = fullParagraph
  .replace(/&apos;|&#39;|&amp;apos;/g, "'")
  .replace(/&quot;|&#34;/g, '"')
  .replace(/&amp;/g, "&");

    words = fullParagraph.length ? fullParagraph.split(" ") : [];
    chunkSize = Math.max(1, Math.ceil(words.length / 10)); // try to create 10 chunks
    window.paragraphs.length = 0;
    for (let i = 0; i < words.length; i += chunkSize) {
        window.paragraphs.push(words.slice(i, i + chunkSize).join(" "));
    }
    if (window.paragraphs.length === 0) {
        window.paragraphs.push("");
    }
    window.state.currentParagraphIndex = 0;
    window.state.paragraph = window.paragraphs[0];
    window.state.defaultWords = window.state.paragraph.split(" ");
}

// -------------------- DOM ready setup --------------------
document.addEventListener("DOMContentLoaded", async () => {
    await initializeTest();

    if ($("paragraph")) {
        $("paragraph").innerHTML = window.state.paragraph || "No paragraph loaded. Please select an exercise.";
    }

    if (document.querySelector(".main-title")) {
        document.querySelector(".main-title").textContent = "Typing Practice Test";
    }
    document.title = "Typing Test";

    // Bind UI event listeners (some elements may not exist in minimal page)
    bindUI();

    // Prepare UI
    refreshTest();
    displaySavedStats();
});

// -------------------- Timer --------------------
function startTimer() {
    if (!window.state.isTestRunning) return;
    const currentTime = performance.now();
    const elapsed = (currentTime - window.state.startTime) / 1000;
    const timeLeft = window.state.totalTime - elapsed;

    if ($("timer")) {
        if (timeLeft <= 0) {
            $("timer").textContent = "Time: 0:00";
        } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = Math.floor(timeLeft % 60);
            $("timer").textContent = `Time: ${minutes}:${seconds.toString().padStart(2, "0")}`;
        }
    }

    if (timeLeft <= 0) {
        if ($("time-over-popup")) $("time-over-popup").style.display = "flex";
        if ($("popup-ok-btn")) $("popup-ok-btn").focus();
        window.state.isTestRunning = false;
        // don't auto-submit until user confirms via popup (consistent with earlier behavior)
    } else {
        requestAnimationFrame(startTimer);
    }
}
window.startTimer = startTimer;

// -------------------- Input handling --------------------
function bindUI() {
    const typingInput = $("typing-input");
    if (typingInput) {
        typingInput.addEventListener("input", (event) => {
            if (!window.state.isTestRunning) {
                window.state.startTime = performance.now();
                window.state.isTestRunning = true;
                requestAnimationFrame(window.startTimer);
            }
        });

        typingInput.addEventListener("keydown", (event) => {
            // Count backspace keypresses
            if (event.key === "Backspace") {
                window.state.backspaceCount++;
            }

            const inputElement = event.target;
            const input = inputElement.value;
            const typedLength = input.trim().split(/\s+/).filter(word => word.length > 0).length;
            const defaultLength = window.state.defaultWords.length || 1;
            const minWordsRequired = Math.floor(0.8 * defaultLength);

            if (event.key === "Enter" || event.key === "ArrowDown" || event.key === "PageDown") {
                // Prevent any action on Enter/ArrowDown if this is the last chunk
                if (window.state.currentParagraphIndex === window.paragraphs.length - 1) {
                    event.preventDefault();
                    return;
                }

                if (typedLength >= minWordsRequired) {
                    if (window.state.currentParagraphIndex < window.paragraphs.length - 1) {
                        const typedChunks = window.state.totalTypedInput.split("|").filter(chunk => chunk.length > 0);
                        typedChunks[window.state.currentParagraphIndex] = input;
                        window.state.totalTypedInput = "|" + typedChunks.join("|") + "|";
                        window.state.currentParagraphIndex++;
                        window.state.paragraph = window.paragraphs[window.state.currentParagraphIndex];
                        window.state.defaultWords = window.state.paragraph.split(" ");
                        if ($("paragraph")) $("paragraph").innerHTML = window.state.paragraph;
                        if ($("current-chunk")) $("current-chunk").textContent = `Current Chunk - ${window.state.currentParagraphIndex + 1}`;
                        if ($("typing-input")) $("typing-input").value = typedChunks[window.state.currentParagraphIndex] || "";
                        event.preventDefault();
                    }
                } else {
                    // If not enough typed words, block action (consistent)
                    event.preventDefault();
                }
            } else if ((event.key === "ArrowUp" || event.key === "PageUp") && window.state.currentParagraphIndex > 0) {
                const typedChunks = window.state.totalTypedInput.split("|").filter(chunk => chunk.length > 0);
                typedChunks[window.state.currentParagraphIndex] = input;
                window.state.totalTypedInput = "|" + typedChunks.join("|") + "|";
                window.state.currentParagraphIndex--;
                window.state.paragraph = window.paragraphs[window.state.currentParagraphIndex];
                window.state.defaultWords = window.state.paragraph.split(" ");
                if ($("paragraph")) $("paragraph").innerHTML = window.state.paragraph;
                if ($("current-chunk")) $("current-chunk").textContent = `Current Chunk - ${window.state.currentParagraphIndex + 1}`;
                if ($("typing-input")) $("typing-input").value = typedChunks[window.state.currentParagraphIndex] || "";
                event.preventDefault();
            }
        });
    }

    // Buttons & popups
    if ($("submit-btn")) $("submit-btn").addEventListener("click", submitResults);
    if ($("refresh-btn")) $("refresh-btn").addEventListener("click", async () => { await initializeTest(); refreshTest(); });
    if ($("popup-ok-btn")) $("popup-ok-btn").addEventListener("click", () => { if ($("time-over-popup")) $("time-over-popup").style.display = "none"; submitResults(); });
    if ($("practice-another-btn")) $("practice-another-btn").addEventListener("click", () => { window.location.href = "exercises.html"; });
    if ($("back-btn")) $("back-btn").addEventListener("click", () => { window.location.href = "exercises.html"; });
    if ($("no-input-ok-btn")) $("no-input-ok-btn").addEventListener("click", () => { if ($("no-input-popup")) $("no-input-popup").style.display = "none"; });
    if ($("refresh-btn-2")) $("refresh-btn-2").addEventListener("click", async () => { await initializeTest(); refreshTest(); });
    if ($("practice-another-btn-2")) $("practice-another-btn-2").addEventListener("click", () => { window.location.href = "exercises.html"; });

    // Fullscreen
    if ($("fullscreen-btn")) {
        $("fullscreen-btn").addEventListener("click", () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    if ($("fullscreen-btn")) $("fullscreen-btn").textContent = "Exit Full Screen";
                }).catch(err => console.error(`Fullscreen error: ${err.message}`));
            } else {
                document.exitFullscreen().then(() => {
                    if ($("fullscreen-btn")) $("fullscreen-btn").textContent = "Full Screen";
                });
            }
        });
    }
}

// -------------------- Refresh and submit --------------------
function refreshTest() {
    window.state.currentParagraphIndex = 0;
    window.state.paragraph = window.paragraphs[0];
    window.state.defaultWords = window.state.paragraph.split(" ");
    window.state.totalTypedInput = "|";
    window.state.totalTime = 600;
    window.state.isTestRunning = false;
    window.state.startTime = null;
    window.state.backspaceCount = 0;

    if ($("timer")) $("timer").textContent = "Time: 10:00";
    if (document.querySelector(".main-title")) document.querySelector(".main-title").style.display = "block";
    if (document.querySelector(".test-section")) document.querySelector(".test-section").style.display = "block";
    if ($("current-chunk")) $("current-chunk").textContent = `Current Chunk - ${window.state.currentParagraphIndex + 1}`;
    if ($("current-chunk")) $("current-chunk").style.display = "block";
    if ($("paragraph")) { $("paragraph").style.display = "block"; $("paragraph").innerHTML = window.state.paragraph; }
    if ($("typing-input")) { $("typing-input").style.display = "block"; $("typing-input").value = ""; $("typing-input").disabled = false; }
    if (document.querySelector(".header-row")) document.querySelector(".header-row").style.display = "flex";
    if ($("timer")) $("timer").style.display = "block";
    if (document.querySelector(".reference-outer")) document.querySelector(".reference-outer").style.display = "block";
    if ($("test-area")) $("test-area").style.display = "block";
    if ($("reference-text")) $("reference-text").style.display = "block";
    if ($("submit-btn")) $("submit-btn").style.display = "inline-block";
    if ($("back-btn")) $("back-btn").style.display = "inline-block";

    if ($("results")) $("results").style.display = "none";
    if ($("results-table")) $("results-table").style.display = "none";
    if ($("results-title-row")) $("results-title-row").style.display = "none";
    // Hide other results rows if present
    try {
        document.querySelectorAll("#results-table tr:not(#results-title-row, #notes-section, #button-row)").forEach(row => row.style.display = "none");
    } catch (e) {}
    if ($("saved-stats-container")) $("saved-stats-container").style.display = "block";
    if ($("error-section")) $("error-section").style.display = "none";
    if ($("error-highlight")) $("error-highlight").style.display = "none";
}

// -------------------- Submit & Results --------------------
async function submitResults() {
	// ✅ Show results & hide typing UI
$("results").style.display = "block";
$("results-table").style.display = "table";
document.querySelectorAll("#results-table tr").forEach(r => r.style.display = "table-row");
$("test-section").style.display = "none";

// ✅ Scroll to results at top
setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
}, 300);

    console.log("submitResults called");
    window.state.isTestRunning = false;
    const typingInputEl = $("typing-input");
    const currentInput = typingInputEl ? typingInputEl.value.trim() : "";
    const typedChunks = window.state.totalTypedInput.split("|").filter(chunk => chunk.length > 0);
    if (currentInput) typedChunks[window.state.currentParagraphIndex] = currentInput;
    const validChunks = typedChunks.filter(chunk => chunk.trim().length > 0);
    if (validChunks.length === 0) {
        if ($("no-input-popup")) $("no-input-popup").style.display = "flex";
        window.state.isTestRunning = true;
        return;
    }

    const finalTypedText = validChunks.join(" ").trim();
    window.state.typedWords = finalTypedText.split(/\s+/).filter(word => word.length > 0);
    const allDefaultWords = window.paragraphs.slice(0, validChunks.length).join(" ").split(" ");

    // Build error tables HTML using highlightErrors
    let errorTablesHTML = "";
    for (let i = 0; i < validChunks.length; i++) {
        const chunkDefaultWords = window.paragraphs[i].split(" ");
        const chunkTypedText = validChunks[i] || "";
        const chunkTypedWords = chunkTypedText.split(/\s+/).filter(w => w.length > 0);
        const chunkErrors = highlightErrors(chunkDefaultWords, chunkTypedWords, chunkTypedText);
        errorTablesHTML += `
            <table class="error-table" width="100%"border="2px" style="border-collapse:collapse;">
                <thead>
                    <tr>
                        <th width="50%">Original Chunk #${i + 1}</th>
                        <th width="50%">Typed Chunk #${i + 1}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td width="50%"><span class="given">${window.paragraphs[i]}</span></td>
                        <td width="50%">${chunkErrors || "No errors"}</td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    // Show/hide UI elements
    if (document.querySelector(".main-title")) document.querySelector(".main-title").style.display = "none";
    if (document.querySelector(".test-section")) document.querySelector(".test-section").style.display = "none";
    if ($("results")) $("results").style.display = "block";
    if ($("results-table")) $("results-table").style.display = "table";
    if ($("results-title-row")) $("results-title-row").style.display = "table-row";
    if ($("results-notes")) $("results-notes").style.display = "block";
    if ($("exam-note")) { $("exam-note").style.display = "block"; $("exam-note").innerHTML = '<span class="red-asterisk">*</span>In the PSSSB exam, before time over Test Submisson not Allowed'; }
    if ($("pass-note")) { $("pass-note").style.display = "block"; $("pass-note").innerHTML = '<span class="red-asterisk">*</span>To pass the test, you must type at least 1500 characters with 92% accuracy.'; }
    if ($("button-row")) $("button-row").style.display = "table-row";
    if ($("error-section")) $("error-section").style.display = "block";
    if ($("error-highlight")) { $("error-highlight").style.display = "block"; $("error-highlight").innerHTML = errorTablesHTML; }
    if ($("refresh-btn-2")) $("refresh-btn-2").style.display = "inline-block";
    if ($("practice-another-btn-2")) $("practice-another-btn-2").style.display = "inline-block";


    // --- compute times ---
    const endTime = performance.now();
    const elapsedTimeSeconds = window.state.startTime ? (endTime - window.state.startTime) / 1000 : 0;
    const minutesSpent = Math.floor(elapsedTimeSeconds / 60);
    const secondsSpent = Math.floor(elapsedTimeSeconds % 60);

    // --- gross characters calculation using the generated highlighted HTML ---
    let grossCharacters = 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = errorTablesHTML;

    // Process correct spans
    const correctSpans = tempDiv.querySelectorAll('.correct');
    for (const span of correctSpans) {
        if (!span.textContent.includes('[')) {
            grossCharacters += span.textContent.length;
        }
    }

    // Process wrong spans with rules
    const wrongSpans = tempDiv.querySelectorAll('.wrong');
    for (const span of wrongSpans) {
        const txt = span.textContent || "";
        if (txt.includes('[Extra:')) {
            const m = txt.match(/\[Extra:\s*(.*?)\]/);
            if (m && m[1]) grossCharacters += m[1].length;
        } else if (txt.includes('[Extra Space]') || txt.includes('[Missing Space]')) {
            // don't count these in gross characters
            continue;
        } else if (txt.includes('[Skipped:')) {
            continue;
        } else if (!txt.includes('[')) {
            // regular wrong word — try to find next .given sibling to compare length
            const next = span.nextElementSibling;
            if (next && next.classList && next.classList.contains('given')) {
                const wrongWordLength = span.textContent.length;
                const givenWordLength = next.textContent.length;
                grossCharacters += Math.min(wrongWordLength, givenWordLength);
            } else {
                grossCharacters += span.textContent.length;
            }
        }
    }

    // Add spaces between typed words (N-1)
    const totalWords = finalTypedText.split(/\s+/).filter(w => w.length > 0).length;
    if (totalWords > 1) {
        grossCharacters += totalWords - 1;
    }

    const wordCount = (grossCharacters / 5).toFixed(1);
    const skippedWordsCount = (errorTablesHTML.match(/\[Skipped:/g) || []).length;
    const wrongExtraWordsCount = (errorTablesHTML.match(/<span class="wrong">(?!\[Skipped:|\[Missing Space\]|\[Extra Space\])/g) || []).length;
    const spaceErrorsCount = (errorTablesHTML.match(/\[Extra Space\]|\[Missing Space\]/g) || []).length;

    // error characters rule: 5 chars per wrong/extra word, 2.5 chars per space error
    const errorCharacters = ((skippedWordsCount + wrongExtraWordsCount) * 5) + (spaceErrorsCount * 2.5);
    const netCharacters = (grossCharacters - errorCharacters).toFixed(1);
    const grossSpeed = (grossCharacters / (5 * 10)).toFixed(1); // PSSSB 10-min rule
    const timeSpentInMinutes = elapsedTimeSeconds > 0 ? (elapsedTimeSeconds / 60) : 0.0001;
    const actualGrossSpeed = (grossCharacters / (5 * timeSpentInMinutes)).toFixed(1);
    const accuracyPercentage = grossCharacters > 0 ? ((100 * netCharacters) / grossCharacters).toFixed(1) : 0;
    const result = (grossCharacters >= 1500 && accuracyPercentage >= 92) ? "Pass" : "Fail";

    // Update UI values
    if ($("gross-characters-value")) $("gross-characters-value").textContent = `${grossCharacters} (Words = ${wordCount})`;
    if ($("skipped-words-value")) $("skipped-words-value").textContent = `${skippedWordsCount}`;
    if ($("wrong-extra-words-value")) $("wrong-extra-words-value").textContent = `${wrongExtraWordsCount}`;
    if ($("space-errors-value")) $("space-errors-value").textContent = `${spaceErrorsCount}`;
    if ($("error-characters-value")) $("error-characters-value").textContent = `${errorCharacters.toFixed(1)}`;
    if ($("net-characters-value")) $("net-characters-value").textContent = `${netCharacters}`;
    if ($("gross-speed-value")) $("gross-speed-value").textContent = `${grossSpeed} WPM (According to PSSSB 10 Min Rule)`;
    if ($("actual-gross-speed-value")) $("actual-gross-speed-value").textContent = `${actualGrossSpeed} WPM`;
    if ($("time-spent-value")) $("time-spent-value").textContent = `${minutesSpent} min ${secondsSpent.toString().padStart(2, "0")} sec`;
    if ($("accuracy-percentage-value")) $("accuracy-percentage-value").textContent = `${accuracyPercentage}%`;
    if ($("backspace-count-value")) $("backspace-count-value").textContent = `${window.state.backspaceCount}`;
    if ($("result-value")) $("result-value").textContent = `${result} (Typed ${grossCharacters} characters with ${accuracyPercentage}% accuracy)`;

    // After results are displayed, save the stats
    const stats = {
        grossCharacters: parseInt(grossCharacters),
        accuracy: parseFloat(accuracyPercentage),
        grossSpeed: parseFloat(grossSpeed),
        actualSpeed: parseFloat(actualGrossSpeed),
        timeSpent: `${minutesSpent}m ${secondsSpent}s`,
        result: result,
        timestamp: new Date().toISOString()
    };

    saveTestStats(stats);
}






// Expose submit
window.submitResults = submitResults;

// -------------------- highlightErrors (your full engine) --------------------
function highlightErrors(defaultWords, typedWords, originalInput) {
    let highlightedParagraph = "";
    let defaultIndex = 0;
    let typedIndex = 0;
    let inputIndex = 0;

    while (defaultIndex < defaultWords.length && typedIndex < typedWords.length) {
        let currentTypedWord = typedWords[typedIndex];
        let currentDefaultWord = defaultWords[defaultIndex];

        // Combined typed -> matches default (typed split across two typed words)
        if (typedIndex + 1 < typedWords.length) {
            const nextTypedWord = typedWords[typedIndex + 1];
            const combinedTyped = currentTypedWord + nextTypedWord;
            if (combinedTyped === currentDefaultWord || combinedTyped.toLowerCase() === currentDefaultWord.toLowerCase()) {
                inputIndex += currentTypedWord.length;
                let spaceCountBetween = 0;
                while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) {
                    spaceCountBetween++;
                    inputIndex++;
                }
                if (spaceCountBetween > 0) {
                    highlightedParagraph += `<span class="correct">${currentTypedWord}</span><span class="wrong">[Missing Space]</span>`;
                    for (let i = 0; i < spaceCountBetween - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
                    highlightedParagraph += `<span class="correct">${nextTypedWord}</span> `;
                    if (combinedTyped !== currentDefaultWord) highlightedParagraph += `<span class="given">${currentDefaultWord}</span> `;
                }
                inputIndex += nextTypedWord.length;
                let spaceCountAfter = 0;
                while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) {
                    spaceCountAfter++;
                    inputIndex++;
                }
                if (spaceCountAfter > 1) {
                    for (let i = 0; i < spaceCountAfter - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
                }
                defaultIndex++;
                typedIndex += 2;
                continue;
            }
        }

        // Combined default words (missing space)
        if (defaultIndex + 1 < defaultWords.length) {
            const nextDefaultWord = defaultWords[defaultIndex + 1];
            const combinedDefault = currentDefaultWord + nextDefaultWord;

            if (currentTypedWord === combinedDefault) {
                highlightedParagraph += `<span class="correct">${currentDefaultWord}</span><span class="wrong">[Missing Space]</span><span class="correct">${nextDefaultWord}</span> `;
                inputIndex += currentTypedWord.length;
                defaultIndex += 2;
                typedIndex++;
                let spaceCount = 0;
                while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) {
                    spaceCount++; inputIndex++;
                }
                if (spaceCount > 1) for (let i = 0; i < spaceCount - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
                continue;
            }

            // Combined typed with correct first part, wrong second part
            if (currentTypedWord !== currentDefaultWord &&
                currentTypedWord.startsWith(currentDefaultWord) &&
                currentTypedWord.length > currentDefaultWord.length &&
                !currentDefaultWord.startsWith(currentTypedWord) &&
                (typedIndex + 1 >= typedWords.length || typedWords[typedIndex + 1] !== nextDefaultWord)) {

                const secondPart = currentTypedWord.slice(currentDefaultWord.length);
                if (secondPart.length > 0) {
                    highlightedParagraph += `<span class="correct">${currentDefaultWord}</span><span class="wrong">[Missing Space]</span>`;
                    if (secondPart === nextDefaultWord) {
                        highlightedParagraph += `<span class="correct">${secondPart}</span> `;
                    } else {
                        highlightedParagraph += `<span class="wrong">${secondPart}</span> <span class="given">${nextDefaultWord}</span> `;
                    }
                    inputIndex += currentTypedWord.length;
                    defaultIndex += 2;
                    typedIndex++;
                    let spaceCount = 0;
                    while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) {
                        spaceCount++; inputIndex++;
                    }
                    if (spaceCount > 1) for (let i = 0; i < spaceCount - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
                    continue;
                }
            }

            // Combined typed with wrong first part, correct second part
            if (currentTypedWord !== currentDefaultWord &&
                currentTypedWord.endsWith(nextDefaultWord) &&
                currentTypedWord.length > nextDefaultWord.length &&
                !nextDefaultWord.startsWith(currentTypedWord)) {
                const firstPart = currentTypedWord.slice(0, currentTypedWord.length - nextDefaultWord.length);
                if (firstPart.length > 0) {
                    highlightedParagraph += `<span class="wrong">${firstPart}</span> <span class="given">${currentDefaultWord}</span><span class="wrong">[Missing Space]</span><span class="correct">${nextDefaultWord}</span> `;
                    inputIndex += currentTypedWord.length;
                    defaultIndex += 2;
                    typedIndex++;
                    let spaceCount = 0;
                    while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) {
                        spaceCount++; inputIndex++;
                    }
                    if (spaceCount > 1) for (let i = 0; i < spaceCount - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
                    continue;
                }
            }

            // dotted tokens and similar cases
            if (currentTypedWord.match(/^\w+\.\w+$/)) {
                const splitWord = currentTypedWord.split(/(\w+\.)/).filter(Boolean);
                if (splitWord.length === 2) {
                    const firstPart = splitWord[0];
                    const secondPart = splitWord[1];
                    const expectedFirst = currentDefaultWord;
                    const expectedSecond = nextDefaultWord;

                    if (firstPart === expectedFirst) {
                        if (secondPart === expectedSecond) {
                            highlightedParagraph += `<span class="correct">${firstPart}</span><span class="wrong">[Missing Space]</span><span class="correct">${secondPart}</span> `;
                        } else if (secondPart.toLowerCase() === expectedSecond.toLowerCase()) {
                            highlightedParagraph += `<span class="correct">${firstPart}</span><span class="wrong">[Missing Space]</span><span class="wrong">${secondPart}</span> <span class="given">${expectedSecond}</span> `;
                        } else {
                            highlightedParagraph += `<span class="wrong">${currentTypedWord}</span> <span class="given">${expectedFirst}</span> `;
                            inputIndex += currentTypedWord.length;
                            typedIndex++;
                            continue;
                        }
                        inputIndex += currentTypedWord.length;
                        defaultIndex += 2;
                        typedIndex++;
                        continue;
                    }
                }
            } else if (currentTypedWord === combinedDefault || currentTypedWord.toLowerCase() === combinedDefault.toLowerCase()) {
                const firstPart = currentDefaultWord;
                const secondPart = currentTypedWord.slice(firstPart.length);
                if (secondPart === nextDefaultWord) {
                    highlightedParagraph += `<span class="correct">${firstPart}</span><span class="wrong">[Missing Space]</span><span class="correct">${secondPart}</span> `;
                } else if (secondPart.toLowerCase() === nextDefaultWord.toLowerCase()) {
                    highlightedParagraph += `<span class="correct">${firstPart}</span><span class="wrong">[Missing Space]</span><span class="wrong">${secondPart}</span> <span class="given">${nextDefaultWord}</span> `;
                } else {
                    highlightedParagraph += `<span class="wrong">${currentTypedWord}</span> <span class="given">${firstPart}</span> `;
                    inputIndex += currentTypedWord.length;
                    typedIndex++;
                    continue;
                }
                inputIndex += currentTypedWord.length;
                defaultIndex += 2;
                typedIndex++;
                continue;
            }
        }

        // Exact match
        if (currentTypedWord === currentDefaultWord) {
            highlightedParagraph += `<span class="correct">${currentTypedWord}</span> `;
            inputIndex += currentTypedWord.length;
            defaultIndex++;
            typedIndex++;
            let spaceCount = 0;
            while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) { spaceCount++; inputIndex++; }
            if (spaceCount > 1) for (let i = 0; i < spaceCount - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
            continue;
        }

        // Case-insensitive match but case wrong
        if (currentTypedWord.toLowerCase() === currentDefaultWord.toLowerCase()) {
            highlightedParagraph += `<span class="wrong">${currentTypedWord}</span> <span class="given">${currentDefaultWord}</span> `;
            inputIndex += currentTypedWord.length;
            defaultIndex++;
            typedIndex++;
            let spaceCount = 0;
            while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) { spaceCount++; inputIndex++; }
            if (spaceCount > 1) for (let i = 0; i < spaceCount - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
            continue;
        }

        // Extra typed word (followed by expected)
        if (typedIndex + 1 < typedWords.length &&
            (typedWords[typedIndex + 1] === currentDefaultWord ||
             typedWords[typedIndex + 1].toLowerCase() === currentDefaultWord.toLowerCase())) {
            highlightedParagraph += `<span class="wrong"><u>[${currentTypedWord}]</u></span> `;
            inputIndex += currentTypedWord.length;
            typedIndex++;
            let spaceCount = 0;
            while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) { spaceCount++; inputIndex++; }
            if (spaceCount > 1) for (let i = 0; i < spaceCount - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
            continue;
        }

        // Try to find typed word later in defaultWords (skipped words)
        let skipCount = 0;
        let foundMatch = false;
        for (let i = defaultIndex + 1; i < defaultWords.length && i < defaultIndex + typedWords.length - typedIndex; i++) {
            if (currentTypedWord.toLowerCase() === defaultWords[i].toLowerCase()) {
                skipCount = i - defaultIndex;
                foundMatch = true;
                break;
            }
        }
        if (foundMatch) {
            for (let i = 0; i < skipCount; i++) {
                const skippedWord = defaultWords[defaultIndex + i];
                highlightedParagraph += `<span class="given">${skippedWord}</span> <span class="wrong"><del>[${skippedWord}]</del></span> `;
               
            }
            if (currentTypedWord === defaultWords[defaultIndex + skipCount]) {
                highlightedParagraph += `<span class="correct">${currentTypedWord}</span> `;
            } else {
                highlightedParagraph += `<span class="wrong">${currentTypedWord}</span> <span class="given">${defaultWords[defaultIndex + skipCount]}</span> `;
            }
            inputIndex += currentTypedWord.length;
            defaultIndex += skipCount + 1;
            typedIndex++;
            continue;
        }


// NEW RULE: If user typed the correct word later, ignore earlier wrong attempts
let lookAheadIndex = typedWords.indexOf(currentDefaultWord, typedIndex);
if (lookAheadIndex !== -1 && lookAheadIndex > typedIndex) {
    // This current wrong word is a repeated wrong attempt
    highlightedParagraph += `<span class="wrong"><u>[${currentTypedWord}]</u></span> `;
    inputIndex += currentTypedWord.length;
    typedIndex++;
    continue;
}

{
    let skipCount = 0;
    let foundMatch = false;
    for (let i = defaultIndex + 1; i < defaultWords.length; i++) {
        if (currentTypedWord.toLowerCase() === defaultWords[i].toLowerCase()) {
            skipCount = i - defaultIndex;
            foundMatch = true;
            break;
        }
    }
    if (foundMatch) {
        for (let i = 0; i < skipCount; i++) {
            const skippedWord = defaultWords[defaultIndex + i];
            highlightedParagraph += `<span class="given">${skippedWord}</span> `;
        }
        highlightedParagraph += `<span class="correct">${currentTypedWord}</span> `;
        inputIndex += currentTypedWord.length;
        defaultIndex += skipCount + 1;
        typedIndex++;
        continue;
    }
}

        // Otherwise regular wrong
        highlightedParagraph += `<span class="wrong">${currentTypedWord}</span> <span class="given">${currentDefaultWord}</span> `;
        inputIndex += currentTypedWord.length;
        defaultIndex++;
        typedIndex++;
        let spaceCount = 0;
        while (inputIndex < originalInput.length && /\s/.test(originalInput[inputIndex])) { spaceCount++; inputIndex++; }
        if (spaceCount > 1) for (let i = 0; i < spaceCount - 1; i++) highlightedParagraph += `<span class="wrong">[Extra Space]</span> `;
    }

    // Remaining extra typed words
    while (typedIndex < typedWords.length) {
        highlightedParagraph += `<span class="wrong"><u>[${typedWords[typedIndex]}]</u></span> `;
        typedIndex++;
    }

    // Remaining default words (not typed)
    while (defaultIndex < defaultWords.length) {
        highlightedParagraph += `<span class="given">${defaultWords[defaultIndex]}</span> `;
        defaultIndex++;
    }

    return highlightedParagraph.trim();
}
window.highlightErrors = highlightErrors;

// -------------------- Saved stats (localStorage) --------------------
function isLocalStorageAvailable() {
    try {
        const testKey = '__testLocalStorage__';
        localStorage.setItem(testKey, 'test');
        const result = localStorage.getItem(testKey) === 'test';
        localStorage.removeItem(testKey);
        return result;
    } catch (e) {
        return false;
    }
}

function saveTestStats(stats) {
    try {
        if (!isLocalStorageAvailable()) {
            showLocalStorageError();
            return;
        }
        let savedStats = [];
        try {
            const savedStatsJson = localStorage.getItem('typingTestStats');
            savedStats = savedStatsJson ? JSON.parse(savedStatsJson) : [];
            if (!Array.isArray(savedStats)) savedStats = [];
        } catch (e) {
            savedStats = [];
        }
        savedStats.push(stats);
        if (savedStats.length > 10) savedStats.shift();
        localStorage.setItem('typingTestStats', JSON.stringify(savedStats));
        displaySavedStats();
    } catch (error) {
        showLocalStorageError();
    }
}







function showLocalStorageError() {
    const container = $("saved-stats-container") || document.querySelector('.container') || document.body;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = '<strong>Error:</strong> Unable to save test history locally.';
    container.prepend(errorDiv);
}

function displaySavedStats() {
    if (!isLocalStorageAvailable()) {
        showLocalStorageError();
        return;
    }
    const statsJSON = localStorage.getItem('typingTestStats');
    const savedStats = statsJSON ? JSON.parse(statsJSON) : [];
    const statsContainer = $("saved-stats-container");

    if (!statsContainer) return;
    if (!Array.isArray(savedStats) || savedStats.length === 0) {
        statsContainer.innerHTML = '<p>No previous test data available.</p>';
        return;
    }

    let tableHTML = `
        <h3>Your Test History</h3>
        <table class="stats-history-table">
            <thead><tr>
                <th>Date</th><th>Gross Chars</th><th>Accuracy</th><th>Gross Speed</th><th>Actual Speed</th><th>Time</th><th>Result</th>
            </tr></thead><tbody>
    `;

    savedStats.slice().reverse().forEach(stat => {
        const date = new Date(stat.timestamp);
        const formatted = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
        tableHTML += `<tr>
            <td>${formatted}</td>
            <td>${stat.grossCharacters}</td>
            <td>${stat.accuracy}%</td>
            <td>${stat.grossSpeed} WPM</td>
            <td>${stat.actualSpeed} WPM</td>
            <td>${stat.timeSpent}</td>
            <td class="${stat.result === 'Pass' ? 'pass-result' : 'fail-result'}">${stat.result}</td>
        </tr>`;
    });

    tableHTML += `</tbody></table>
    <div class="stats-note"><span class="red-asterisk">*</span>The test history is saved locally in your browser. Clearing cache will remove history.</div>
    <button id="clear-stats-btn" class="small-btn">Clear History</button>`;

    statsContainer.innerHTML = tableHTML;
    const clearBtn = $("clear-stats-btn");
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your test history?')) {
                localStorage.removeItem('typingTestStats');
                displaySavedStats();
            }
        });
    }
}

// -------------------- Full-screen control binding is done in bindUI above --------------------
// script.js — inside your test submission logic
document.getElementById("submit-btn").addEventListener("click", () => {
  const userName = localStorage.getItem("userName");
  const userRefNo = localStorage.getItem("userRefNo");

  // Use your actual computed values here:
  const speed = calculatedSpeed;     
  const accuracy = calculatedAccuracy;

  // Save result to Google Sheet
  saveResultToSheet(userName, userRefNo, speed, accuracy);
});
// End of file
/******************************************************
 * ✅ GOOGLE SHEET SAVE + TOP 10 LEADERBOARD (Smartech)
 ******************************************************/
/******************************************************
 * ✅ GOOGLE SHEET SAVE + TOP 10 LEADERBOARD (Smartech)
 * Matches columns: formatTimeStamp | Ref No | Name | Language | Speed | Accuracy | Backspace
 ******************************************************/
const GOOGLE_SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxT0mhZ0q-QLkIbJIqG8uIasrjLvx3HuQynmxcYswu3e8r_osUPkCZG2neBTPlcX3Hcrg/exec";

// ✅ Save one test result to the Sheet
async function sendResultToGoogleSheet(refNo, name, language, speed, accuracy, backspace) {
  const data = {
    timeStamp: new Date().toLocaleString(),
    refNo,
    name,
    language,
    speed,
    accuracy,
    backspace,
    action: "save"
  };

  try {
    await fetch(GOOGLE_SHEET_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    console.log("✅ Result saved to Google Sheet:", data);
  } catch (err) {
    console.error("❌ Google Sheet save error:", err);
  }
}

// ✅ Collect current test data and call saver
function saveResultToSheet() {
	
  const refNo = document.getElementById("userRefNo")?.value?.trim() || "N/A";
  const name = document.getElementById("userName")?.value?.trim() || "Unknown";
  const language = document.getElementById("backspacecount");//localStorage.getItem("selectedExerciseText") || "English";
  const speed = document.getElementById("actual-gross-speed-value")?.innerText?.replace("WPM", "").trim() || "0";
  const accuracy = document.getElementById("accuracy-percentage-value")?.innerText?.replace("%", "").trim() || "0";
  const backspace = document.getElementById("backspace-count-value")?.innerText || "0";
  

  if (refNo && name) {
    sendResultToGoogleSheet(refNo, name, language, speed, accuracy, backspace);
  } else {
    console.warn("⚠️ Missing Name or Ref No");
  }
}

/* ✅ Fetch and display Top 10 results
async function loadTop10Results() {
  try {
    const response = await fetch(GOOGLE_SHEET_ENDPOINT);
    const data = await response.json();

    const leaderboardBody = document.getElementById("leaderboard-body");
    leaderboardBody.innerHTML = "";

    if (!data || data.length === 0) {
      leaderboardBody.innerHTML = `<tr><td colspan="4">No results found.</td></tr>`;
      return;
    }

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.refNo}</td>
        <td>${row.speed}</td>
        <td>${row.accuracy}%</td>`;
      leaderboardBody.appendChild(tr);
    });
  } catch (error) {
    console.error("❌ Error loading leaderboard:", error);
    document.getElementById("leaderboard-body").innerHTML =
      `<tr><td colspan="4">Error loading data</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", loadTop10Results);
*/
/* === LOAD TOP 10 === */
async function loadTop10Results() {
  try {
    const res = await fetch(`${GOOGLE_SHEET_URL}?action=top10`);
    const data = await res.json();
    const body = document.getElementById("leaderboard-body");
    body.innerHTML = "";
    if (!data.length) {
      body.innerHTML = `<tr><td colspan="4">No results found</td></tr>`;
      return;
    }
    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.name}</td>
        <td>${row.refNo}</td>
        <td>${row.speed}</td>
        <td>${row.accuracy}%</td>`;
      body.appendChild(tr);
    });
  } catch (e) {
    console.error("❌ Load error:", e);
    document.getElementById("leaderboard-body").innerHTML =
      `<tr><td colspan="4">Error loading data</td></tr>`;
  }
}
document.addEventListener("DOMContentLoaded", loadTop10Results);
// ✅ Auto-save every test submission to Google Sheet
const originalSubmit = window.submitResults;
window.submitResults = async function() {
  await originalSubmit(); // run core logic
  saveResultToSheet();   // then save to Sheet
};
