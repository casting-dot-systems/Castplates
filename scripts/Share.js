// scripts/shareHttpLink.js
// Requires the CustomJS plugin.
// Usage: In CustomJS settings, add this file to "Folder" or "Individual files".
// Then add it under "Registered invocable scripts" to bind a hotkey.

class ShareHttpLink {
  constructor() {
    // CHANGE THIS to your deployed GitHub Pages base URL:
    this.REDIRECT_BASE = 'https://nathan-luo.github.io/obsidian-link/';
  }

  _getActiveFile() {
    // Obsidian API: Workspace.getActiveFile() -> TFile | null
    // https://docs.obsidian.md/Reference/TypeScript+API/Workspace/getActiveFile
    return customJS.app.workspace.getActiveFile();
  }

  _getVaultName() {
    // Obsidian API: Vault.getName(): string
    // https://docs.obsidian.md/Reference/TypeScript+API/Vault/getName
    return customJS.app.vault.getName();
  }

  _buildUrl({ vault, file, heading = null, block = null, useAdvanced = false }) {
    const u = new URL(this.REDIRECT_BASE);
    // Our redirector accepts both long and short params:
    u.searchParams.set('vault', vault);
    u.searchParams.set('file', file);
    if (heading) u.searchParams.set('h', heading);
    if (block)   u.searchParams.set('block', block);
    if (useAdvanced) u.searchParams.set('adv', '1'); // optional
    return u.toString();
  }

  async _copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for environments w/o Clipboard API permissions
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
  }

  async invoke() {
    const file = this._getActiveFile();
    if (!file) {
      new Notice('No active file to share.', 3000); // https://docs.obsidian.md/Reference/TypeScript+API/Notice
      return;
    }
    const vault = this._getVaultName();
    // TFile.path is the path relative to vault root, e.g. "Folder/Note.md"
    // https://docs.obsidian.md/Reference/TypeScript+API/TFile
    const link = this._buildUrl({ vault, file: file.path });

    await this._copyToClipboard(link);
    new Notice('Share link copied to clipboard ✅', 2500);
  }
}

