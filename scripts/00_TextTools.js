// scripts/00_TextTools.js
class TextTools {
  /** Convenience: show an Obsidian notice */
  _notice(msg, timeout = 3000) {
    try { new customJS.obsidian.Notice(msg, timeout); } catch (_) {}
  }

  /** Active Markdown editor or null */
  _getEditor() {
    const { MarkdownView } = customJS.obsidian;
    const view = app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      this._notice("Open a Markdown file to use this command.");
      return null;
    }
    return view.editor;
  }

  /** Read plain text from the clipboard with fallbacks for desktop & mobile */
  async readClipboardText() {
    let text = "";
    try { text = await navigator.clipboard.readText(); } catch (_) {}
    if (!text && typeof window !== "undefined" && typeof window.require === "function") {
      try { text = window.require("electron").clipboard.readText() || ""; } catch (_) {}
    }
    if (!text) this._notice("Clipboard is empty or not accessible.");
    return text;
  }

  /** Returns true if the text contains any level‑1 heading (ATX '# ' or setext '===') */
  _hasH1(text) {
    const lines = text.split(/\r?\n/);
    let inFence = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Toggle code fence state
      if (/^\s{0,3}(```|~~~)/.test(line)) { inFence = !inFence; continue; }
      if (inFence) continue;

      // ATX H1: '# ' but not '## '
      if (/^\s{0,3}(?:>+\s*)?#(?!#)\s+/.test(line)) return true;

      // Simple setext H1: "Title" line followed by "==="
      if (
        i + 1 < lines.length &&
        /^\s{0,3}=+\s*$/.test(lines[i + 1]) &&
        lines[i].trim().length > 0 &&
        !/^\s{0,3}(?:>+\s*)/.test(lines[i]) // ignore quoted setext to keep logic simple
      ) {
        return true;
      }
    }
    return false;
  }

  /** Convert basic setext H1/H2 to ATX (# / ##), skipping code fences */
  _convertSetextToATX(text) {
    const lines = text.split(/\r?\n/);
    const out = [];
    let inFence = false;

    for (let i = 0; i < lines.length; i++) {
      const cur = lines[i];

      if (/^\s{0,3}(```|~~~)/.test(cur)) {
        inFence = !inFence;
        out.push(cur);
        continue;
      }
      if (inFence) { out.push(cur); continue; }

      const next = i + 1 < lines.length ? lines[i + 1] : "";
      if (next && /^\s{0,3}=+\s*$/.test(next) && cur.trim().length > 0 && !/^\s{0,3}(?:>+\s*)/.test(cur)) {
        out.push(`# ${cur.trim()}`);
        i++; // skip underline
        continue;
      }
      if (next && /^\s{0,3}-+\s*$/.test(next) && cur.trim().length > 0 && !/^\s{0,3}(?:>+\s*)/.test(cur)) {
        out.push(`## ${cur.trim()}`);
        i++; // skip underline
        continue;
      }
      out.push(cur);
    }
    return out.join("\n");
  }

  /**
   * Demote ATX headings by one level (e.g., '# '→'## ', '### '→'#### '), capped at H6.
   * Skips content inside triple‑backtick/tilde code fences. Also supports headings inside blockquotes.
   */
  _demoteATX(text) {
    const lines = text.split(/\r?\n/);
    let inFence = false;

    const demoted = lines.map((line) => {
      if (/^\s{0,3}(```|~~~)/.test(line)) { inFence = !inFence; return line; }
      if (inFence) return line;

      // Capture optional blockquote markers, then 1..6 hashes, then the space
      return line.replace(/^(\s{0,3}(?:>+\s*)?)(#{1,6})(\s+)/, (_, lead, hashes, space) => {
        if (hashes.length < 6) hashes = hashes + "#";
        return `${lead}${hashes}${space}`;
      });
    });

    return demoted.join("\n");
  }

  /**
   * Apply the rule:
   *   "Make all headings one level lower **if and only if** the pasted text contains any level‑1 headings;
   *    otherwise, keep headings as‑is."
   * Also normalizes basic setext headings to ATX before demotion.
   */
  demoteHeadingsIfHasH1(text) {
    if (!text) return text;
    if (!this._hasH1(text)) return text;
    const atxReady = this._convertSetextToATX(text);
    return this._demoteATX(atxReady);
  }

  /** Select the range that was just inserted */
  _selectInserted(editor, startPos) {
    try {
      const endPos = editor.getCursor(); // after insertion, caret sits at end
      // Prefer explicit 'from'/'to' accessors if available; otherwise, fall back to start→end
      editor.setSelection(startPos, endPos);
    } catch (_) {}
  }

  /** Starting position for a paste: selection start if any, else cursor */
  _pasteStart(editor) {
    try { return editor.getCursor("from"); } catch (_) {}
    return editor.getCursor();
  }
}

