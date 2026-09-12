GhostProof

Digital Evidence Integrity Analysis Tool

🌐 Live Demo: https://ghostproof-one.vercel.app/

GhostProof is a browser-based MVP for analyzing digital evidence and identifying possible inconsistencies in evidence timelines.

Features

🔐 Calculates SHA-256 hashes locally

🕒 Extracts basic timestamps from supported text-based evidence

📅 Builds an evidence timeline

⚠️ Flags possible timestamp inconsistencies

📊 Displays file details and integrity information

📄 Exports an analysis report as JSON

🔒 Files are analyzed locally in the browser by this MVP

How to Use

Open the GhostProof live demo.

Click Choose files or drag evidence into the upload area.

Click Analyze evidence.

Review the hashes, timeline, possible inconsistencies, and file details.

Click Export report to save the analysis as JSON.

Test File

A sample test file is included in this project:

ghostproof-test.txt

You can use it to verify timestamp extraction, timeline generation, hashing, and report export.

Privacy

GhostProof's current MVP performs file analysis locally in the user's browser. The uploaded files are not sent to a GhostProof backend.

Important Disclaimer

GhostProof provides indicators for investigation. It does not automatically prove that evidence has been manipulated.

For real investigations, preserve original evidence and verify findings using appropriate forensic procedures, acquisition methods, metadata, and chain-of-custody practices.

Technology

HTML

CSS

JavaScript

Web Crypto API

Vercel

License

This project is licensed under the MIT License.

Copyright (c) 2026 BRKE

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

GhostProof — Find the gaps in your evidence timeline.
