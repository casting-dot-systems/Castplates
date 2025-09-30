// Scripts/templater/text_tools.js
/* CommonJS module for Templater user functions */

function normalizeEol(s) {
  return s.replace(/\r\n?/g, "\n");
}

function setextToAtx(s) {
  return s
    .replace(/^([^\n]+)\n=+\s*$/gm, (_m, title) => `# ${title}`)
    .replace(/^([^\n]+)\n-+\s*$/gm, (_m, title) => `## ${title}`);
}

function demoteAtx(s) {
  return s.replace(/^( {0,3})(#{1,6})(\s+)(.*)$/gm, (_m, indent, hashes, sp, rest) => {
    const next = hashes.length < 6 ? hashes + "#" : hashes; // cap at 6
    return `${indent}${next}${sp}${rest}`;
  });
}

function demoteHeadingsAll(text) {
  return demoteAtx(setextToAtx(normalizeEol(text)));
}

function getEditor(tp) {
  const view = app.workspace.getActiveViewOfType(tp.obsidian.MarkdownView);
  return view ? view.editor : null;
}

function beginInsertion(editor) {
  const start = editor.getCursor("from");
  const startOffset = editor.posToOffset(start);
  return { start, startOffset };
}

function endPosFrom(editor, startOffset, textLength) {
  return editor.offsetToPos(startOffset + textLength);
}

/** 1) Paste (plain) and demote headings (# -> ##) */
async function pastePlainDemote(tp) {
  const editor = getEditor(tp);
  if (!editor) return;
  const raw = await tp.system.clipboard();
  if (raw == null) return;

  const text = demoteHeadingsAll(raw);
  const { startOffset } = beginInsertion(editor);
  editor.replaceSelection(text);
  const end = endPosFrom(editor, startOffset, text.length);
  editor.setCursor(end);
}

/** 2) Paste (plain) and select pasted text */
async function pastePlainSelect(tp) {
  const editor = getEditor(tp);
  if (!editor) return;
  const raw = await tp.system.clipboard();
  if (raw == null) return;

  const text = normalizeEol(raw);
  const { start, startOffset } = beginInsertion(editor);
  editor.replaceSelection(text);
  const end = endPosFrom(editor, startOffset, text.length);
  editor.setSelection(start, end);
}

/** 3) Insert the current file title */
function insertTitle(tp) {
  const editor = getEditor(tp);
  if (!editor) return;
  editor.replaceSelection(tp.file.title);
}

/** Build obsidian://open URL for the current file */
function buildObsidianOpenUrl(tp) {
  const vaultName = app.vault.getName();
  const relPath = tp.file.path(true); // vault-relative
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(relPath)}`;
}

/** 4) Insert a Markdown link [Title](<obsidian://...>) to this file */
function insertObsidianLinkToThisFile(tp, options = {}) {
  const editor = getEditor(tp);
  if (!editor) return;

  const url = buildObsidianOpenUrl(tp);
  const alias = options.alias || tp.file.title;
  const md = `[${alias}](<${url}>)`;
  editor.replaceSelection(md);

  if (options.copyToClipboard === true) {
    try { navigator.clipboard.writeText(url); } catch (_) {}
  }
}

module.exports = {
  pastePlainDemote,
  pastePlainSelect,
  insertTitle,
  insertObsidianLinkToThisFile,
};

