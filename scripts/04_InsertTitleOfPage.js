// scripts/04_InsertTitleOfPage.js
class InsertTitleOfPage {
  async invoke() {
    const tools = customJS.TextTools;
    const editor = tools._getEditor();
    if (!editor) return;

    const file = app.workspace.getActiveFile();
    if (!file) { tools._notice("No active file."); return; }

    const title = file.basename;

    // Change the next line to `const toInsert = "## " + title;` if you prefer inserting as an H2 heading.
    const toInsert = title;

    editor.replaceSelection(toInsert);
  }
}

