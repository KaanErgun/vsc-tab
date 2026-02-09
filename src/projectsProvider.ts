import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface ProjectTab {
    id: string;
    name: string;
    path: string;
}

// ── Tree Item ──────────────────────────────────────────────

export class TabTreeItem extends vscode.TreeItem {
    constructor(
        public readonly tab: ProjectTab,
        public readonly isActive: boolean
    ) {
        super(tab.name, vscode.TreeItemCollapsibleState.None);

        this.tooltip = `${tab.path}`;
        this.description = isActive ? '● active' : tab.path;
        this.contextValue = isActive ? 'tab-active' : 'tab';
        this.iconPath = new vscode.ThemeIcon(
            isActive ? 'folder-opened' : 'folder',
            isActive ? new vscode.ThemeColor('charts.green') : undefined
        );

        // Tab'a tıklayınca klasörü aç
        this.command = {
            command: 'vsc-tab.switchTab',
            title: 'Switch to Project',
            arguments: [this]
        };
    }
}

// ── Provider ───────────────────────────────────────────────

export class ProjectsProvider implements vscode.TreeDataProvider<TabTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<TabTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private tabs: ProjectTab[] = [];
    private activeTabId: string | null = null;

    private _onDidChangeTabs = new vscode.EventEmitter<void>();
    readonly onDidChangeTabs = this._onDidChangeTabs.event;

    constructor(private context: vscode.ExtensionContext) {
        this.load();
        this.detectActiveTab();

        // Workspace klasörleri değiştiğinde aktif tab'ı güncelle
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.detectActiveTab();
            this._onDidChangeTreeData.fire();
            this._onDidChangeTabs.fire();
        });
    }

    /** Dışarıdan tab listesine erişim */
    getTabs(): readonly ProjectTab[] { return this.tabs; }
    getActiveTabId(): string | null { return this.activeTabId; }

    refresh(): void {
        this.detectActiveTab();
        this._onDidChangeTreeData.fire();
        this._onDidChangeTabs.fire();
    }

    // ── Persistence ────────────────────────────────────────

    private load(): void {
        const raw = this.context.globalState.get<any[]>('vsc-tab.projectTabs', []);
        this.activeTabId = this.context.globalState.get<string | null>('vsc-tab.activeTabId', null);

        this.tabs = raw.map(t => ({
            id: t.id || this.genId(),
            name: t.name || 'Unnamed',
            path: t.path || ''
        }));

        // Eski format göçü: tabs veya projects
        if (this.tabs.length === 0) {
            const oldTabs = this.context.globalState.get<any[]>('vsc-tab.tabs', []);
            if (oldTabs.length > 0) {
                // Eski multi-folder tab'lardan göç — her klasörü ayrı tab yap
                for (const tab of oldTabs) {
                    const folders = tab.folders || tab.projects || [];
                    for (const f of folders) {
                        this.tabs.push({
                            id: this.genId(),
                            name: f.name || path.basename(f.path),
                            path: f.path
                        });
                    }
                }
            } else {
                const oldProjects = this.context.globalState.get<any[]>('vsc-tab.projects', []);
                for (const p of oldProjects) {
                    this.tabs.push({
                        id: this.genId(),
                        name: p.name || path.basename(p.path),
                        path: p.path
                    });
                }
            }
            if (this.tabs.length > 0) {
                this.save();
            }
        }
    }

    private save(): void {
        this.context.globalState.update('vsc-tab.projectTabs', this.tabs);
        this.context.globalState.update('vsc-tab.activeTabId', this.activeTabId);
    }

    private genId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    }

    /** Mevcut açık klasöre göre aktif tab'ı bul */
    private detectActiveTab(): void {
        const wsFolders = vscode.workspace.workspaceFolders;
        if (wsFolders && wsFolders.length === 1) {
            const openPath = wsFolders[0].uri.fsPath;
            const match = this.tabs.find(t => t.path === openPath);
            if (match) {
                this.activeTabId = match.id;
                this.save();
                return;
            }
        }
        // Multi-root veya boş ise aktif tab tespit edilemez
    }

    // ── TreeDataProvider ───────────────────────────────────

    getTreeItem(element: TabTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TabTreeItem): Thenable<TabTreeItem[]> {
        if (element) { return Promise.resolve([]); }
        return Promise.resolve(
            this.tabs.map(tab => new TabTreeItem(tab, tab.id === this.activeTabId))
        );
    }

    // ── Çekirdek: Tab'a geçiş ─────────────────────────────

    async switchTab(item: TabTreeItem): Promise<void> {
        const tab = this.tabs.find(t => t.id === item.tab.id);
        if (!tab) { return; }

        if (!fs.existsSync(tab.path)) {
            vscode.window.showErrorMessage(`Folder "${tab.path}" does not exist.`);
            return;
        }

        // Zaten aktif olan tab'a tıklandıysa bir şey yapma
        if (tab.id === this.activeTabId) { return; }

        this.activeTabId = tab.id;
        this.save();

        const uri = vscode.Uri.file(tab.path);

        // Aynı pencerede aç — pencere yeniden yüklenir ama extension hızlı aktive olur
        await vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: false });

        this._onDidChangeTabs.fire();
    }

    /** ID ile tab'a geçiş — status bar'dan çağrılır */
    async switchTabById(tabId: string): Promise<void> {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) { return; }
        const treeItem = new TabTreeItem(tab, false);
        await this.switchTab(treeItem);
    }

    // ── Mevcut klasörü tab olarak kaydet ───────────────────

    async saveCurrentAsTab(): Promise<void> {
        const wsFolders = vscode.workspace.workspaceFolders;
        if (!wsFolders || wsFolders.length === 0) {
            vscode.window.showWarningMessage('No folder is open.');
            return;
        }

        for (const wf of wsFolders) {
            const folderPath = wf.uri.fsPath;
            if (this.tabs.some(t => t.path === folderPath)) {
                continue; // Zaten kayıtlı
            }

            const tabName = wsFolders.length === 1
                ? await vscode.window.showInputBox({
                    prompt: 'Tab name',
                    value: wf.name
                })
                : wf.name;

            if (!tabName) { continue; }

            this.tabs.push({
                id: this.genId(),
                name: tabName,
                path: folderPath
            });
        }

        this.activeTabId = this.tabs.find(t => t.path === wsFolders[0].uri.fsPath)?.id ?? this.activeTabId;
        this.save();
        this.refresh();
        vscode.window.showInformationMessage('Current folder saved as tab.');
    }

    // ── Tab CRUD ───────────────────────────────────────────

    async addTab(): Promise<void> {
        const configuredFolder = vscode.workspace.getConfiguration('vscTab').get<string>('defaultFolder');
        const defaultPath = configuredFolder && configuredFolder.trim() !== ''
            ? configuredFolder
            : require('os').homedir();
        const defaultUri = vscode.Uri.file(defaultPath);
        const uris = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: true,
            openLabel: 'Add Project Folder(s)',
            defaultUri
        });
        if (!uris || uris.length === 0) { return; }

        for (const uri of uris) {
            const folderPath = uri.fsPath;

            if (this.tabs.some(t => t.path === folderPath)) {
                vscode.window.showWarningMessage(`"${path.basename(folderPath)}" is already added.`);
                continue;
            }
            if (!fs.existsSync(folderPath)) {
                vscode.window.showErrorMessage(`"${folderPath}" does not exist.`);
                continue;
            }

            const folderName = path.basename(folderPath);
            const tabName = await vscode.window.showInputBox({
                prompt: 'Tab name',
                value: folderName
            });
            if (!tabName) { continue; }

            this.tabs.push({
                id: this.genId(),
                name: tabName,
                path: folderPath
            });
        }

        this.save();
        this.refresh();
        this._onDidChangeTabs.fire();
    }

    async removeTab(item: TabTreeItem): Promise<void> {
        const answer = await vscode.window.showWarningMessage(
            `Remove tab "${item.tab.name}"?`,
            { modal: true },
            'Remove'
        );
        if (answer !== 'Remove') { return; }

        this.tabs = this.tabs.filter(t => t.id !== item.tab.id);
        if (this.activeTabId === item.tab.id) {
            this.activeTabId = null;
        }
        this.save();
        this.refresh();
        this._onDidChangeTabs.fire();
    }

    async renameTab(item: TabTreeItem): Promise<void> {
        const newName = await vscode.window.showInputBox({
            prompt: 'New name',
            value: item.tab.name
        });
        if (!newName || newName === item.tab.name) { return; }

        const tab = this.tabs.find(t => t.id === item.tab.id);
        if (tab) {
            tab.name = newName;
            this.save();
            this.refresh();
            this._onDidChangeTabs.fire();
        }
    }
}
