// scripts/01_PasteDemoteHeadings.js
class PasteDemoteHeadings {
  async invoke() {
    const tools = customJS.TextTools;
    const editor = tools._getEditor();
    if (!editor) return;

    const start = tools._pasteStart(editor);
    const clip = await tools.readClipboardText();
    if (!clip) return;

    const out = tools.demoteHeadingsIfHasH1(clip);
    editor.replaceSelection(out);
    // No selection; caret remains at end
  }
}

