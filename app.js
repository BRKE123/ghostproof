const state = {
  files: [],
  results: []
};

const $ = (id) => document.getElementById(id);
const dropzone = $("dropzone");
const input = $("fileInput");

$("chooseBtn").onclick = () => input.click();

input.onchange = (e) => {
  addFiles([...e.target.files]);
};

dropzone.ondragover = (e) => {
  e.preventDefault();
  dropzone.classList.add("drag");
};

dropzone.ondragleave = () => {
  dropzone.classList.remove("drag");
};

dropzone.ondrop = (e) => {
  e.preventDefault();
  dropzone.classList.remove("drag");
  addFiles([...e.dataTransfer.files]);
};

$("clearBtn").onclick = () => {
  state.files = [];
  state.results = [];
  renderFiles();
  $("results").classList.add("hidden");
};

$("analyzeBtn").onclick = analyze;

$("exportBtn").onclick = exportReport;

function addFiles(files) {
  const map = new Map(
    state.files.map((f) => [
      f.name + "|" + f.size + "|" + f.lastModified,
      f
    ])
  );

  files.forEach((f) => {
    map.set(f.name + "|" + f.size + "|" + f.lastModified, f);
  });

  state.files = [...map.values()];
  renderFiles();
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";

  const units = ["KB", "MB", "GB"];
  let size = bytes;
  let index = -1;

  do {
    size /= 1024;
    index++;
  } while (size >= 1024 && index < units.length - 1);

  return size.toFixed(1) + " " + units[index];
}

function renderFiles() {
  $("fileList").innerHTML = state.files.length
    ? state.files
        .map(
          (file) => `
            <div class="file-row">
              <span>${escapeHTML(file.name)}</span>
              <span>${formatBytes(file.size)}</span>
            </div>
          `
        )
        .join("")
    : "";

  $("analyzeBtn").disabled = !state.files.length;
}

async function sha256(file) {
  const buffer = await file.arrayBuffer();

  const hash = await crypto.subtle.digest("SHA-256", buffer);

  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function extractDates(text) {
  const dates = [];

  const patterns = [
    /\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?\b/g,

    /\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?\b/g
  ];

  for (const regex of patterns) {
    let match;

    while ((match = regex.exec(text)) && dates.length < 20) {
      let date;

      if (match[1].length === 4) {
        date = new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(match[4] || 0),
          Number(match[5] || 0),
          Number(match[6] || 0)
        );
      } else {
        date = new Date(
          Number(match[3]),
          Number(match[2]) - 1,
          Number(match[1]),
          Number(match[4] || 0),
          Number(match[5] || 0),
          Number(match[6] || 0)
        );
      }

      if (!Number.isNaN(date.getTime())) {
        dates.push(date);
      }
    }
  }

  return dates;
}

async function analyze() {
  $("analyzeBtn").disabled = true;
  $("analyzeBtn").textContent = "Analyzing…";

  const results = [];

  for (const file of state.files) {
    const hash = await sha256(file);

    let extractedDates = [];

    const isTextFile =
      file.type.startsWith("text/") ||
      /\.(log|txt|csv|json|xml|html?|md)$/i.test(file.name);

    if (file.size <= 2 * 1024 * 1024 && isTextFile) {
      try {
        const text = await file.text();
        extractedDates = extractDates(text);
      } catch (error) {
        console.error(error);
      }
    }

    results.push({
      file,
      hash,
      modified: new Date(file.lastModified),
      dates: extractedDates
    });
  }

  state.results = results;

  renderResults();

  $("analyzeBtn").disabled = false;
  $("analyzeBtn").textContent = "Analyze evidence";
}

function renderResults() {
  $("results").classList.remove("hidden");

  $("statFiles").textContent = state.results.length;

  $("statHashes").textContent = state.results.filter(
    (result) => result.hash
  ).length;

  const events = [];

  state.results.forEach((result) => {
    events.push({
      date: result.modified,
      name: result.file.name,
      kind: "File modified"
    });

    result.dates.forEach((date) => {
      events.push({
        date,
        name: result.file.name,
        kind: "Timestamp found in content"
      });
    });
  });

  events.sort((a, b) => a.date - b.date);

  $("timeline").innerHTML = events.length
    ? events
        .map(
          (event) => `
            <div class="event">
              <div class="event-time">
                ${event.date.toLocaleString()}
              </div>

              <div class="dot"></div>

              <div>
                <div class="event-title">
                  ${escapeHTML(event.kind)}
                </div>

                <div class="event-meta">
                  ${escapeHTML(event.name)}
                </div>
              </div>
            </div>
          `
        )
        .join("")
    : "<div class='ok'>No timeline events found.</div>";

  const warnings = [];

  for (const result of state.results) {
    const hasLaterTimestamp = result.dates.some(
      (date) => date > result.modified
    );

    if (hasLaterTimestamp) {
      warnings.push({
        title: `Possible timestamp inconsistency: ${result.file.name}`,

        text:
          "A timestamp found inside the file is later than the file's local modified time. This can have legitimate explanations. Verify the source and timezone before drawing conclusions."
      });
    }
  }

  $("statWarnings").textContent = warnings.length;

  $("warnings").innerHTML = warnings.length
    ? warnings
        .map(
          (warning) => `
            <div class="warning">
              <strong>
                ⚠ ${escapeHTML(warning.title)}
              </strong>

              <p>
                ${escapeHTML(warning.text)}
              </p>
            </div>
          `
        )
        .join("")
    : `
      <div class="ok">
        No obvious inconsistencies detected by the current MVP checks.
      </div>
    `;

  $("details").innerHTML = state.results
    .map(
      (result) => `
        <tr>
          <td>${escapeHTML(result.file.name)}</td>

          <td>
            ${formatBytes(result.file.size)}
          </td>

          <td>
            ${result.modified.toLocaleString()}
          </td>

          <td class="hash">
            ${result.hash}
          </td>
        </tr>
      `
    )
    .join("");
}

function exportReport() {
  const report = {
    tool: "GhostProof MVP",

    generatedAt: new Date().toISOString(),

    note:
      "Indicators only; not proof of tampering.",

    evidence: state.results.map((result) => ({
      name: result.file.name,
      size: result.file.size,
      lastModified: result.modified.toISOString(),
      sha256: result.hash,

      contentTimestamps:
        result.dates.map((date) => date.toISOString())
    }))
  };

  const blob = new Blob(
    [JSON.stringify(report, null, 2)],
    {
      type: "application/json"
    }
  );

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);

  link.download = "ghostproof-report.json";

  link.click();

  URL.revokeObjectURL(link.href);
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
  );
}

renderFiles();
