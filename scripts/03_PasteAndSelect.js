// scripts/03_PasteAndSelect.js
class PasteAndSelect {
  async invoke() {
    const tools = customJS.TextTools;
    const editor = tools._getEditor();
    if (!editor) return;

    const start = tools._pasteStart(editor);
    const clip = await tools.readClipboardText();
    if (!clip) return;

    editor.replaceSelection(clip);
    tools._selectInserted(editor, start);
  }
}

