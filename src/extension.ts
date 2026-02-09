import * as vscode from 'vscode';
import { ProjectsProvider, TabTreeItem } from './projectsProvider';
import { StatusBarManager } from './statusBarManager';

export function activate(context: vscode.ExtensionContext) {

	console.log('VSC Tab extension is now active!');

	const provider = new ProjectsProvider(context);

	const treeView = vscode.window.createTreeView('vsc-tab-projects', {
		treeDataProvider: provider,
		showCollapseAll: false
	});

	// Status bar tab'ları
	const statusBar = new StatusBarManager(
		() => provider.getTabs(),
		() => provider.getActiveTabId()
	);

	// Tab değişikliklerinde status bar'ı güncelle
	provider.onDidChangeTabs(() => statusBar.update());

	context.subscriptions.push(
		treeView,
		statusBar,
		vscode.commands.registerCommand('vsc-tab.addTab', () => provider.addTab()),
		vscode.commands.registerCommand('vsc-tab.removeTab', (item: TabTreeItem) => provider.removeTab(item)),
		vscode.commands.registerCommand('vsc-tab.renameTab', (item: TabTreeItem) => provider.renameTab(item)),
		vscode.commands.registerCommand('vsc-tab.switchTab', (item: TabTreeItem) => provider.switchTab(item)),
		vscode.commands.registerCommand('vsc-tab.switchTabById', (tabId: string) => provider.switchTabById(tabId)),
		vscode.commands.registerCommand('vsc-tab.saveCurrentAsTab', () => provider.saveCurrentAsTab()),
		vscode.commands.registerCommand('vsc-tab.refresh', () => provider.refresh()),
		vscode.commands.registerCommand('vsc-tab.openSettings', async () => {
			const current = vscode.workspace.getConfiguration('vscTab').get<string>('defaultFolder') || 'Not set (uses home directory)';
			const pick = await vscode.window.showQuickPick([
				{ label: '$(folder) Change Default Folder', description: current, id: 'setFolder' },
				{ label: '$(clear-all) Clear Default Folder', description: 'Reset to home directory', id: 'clearFolder' },
				{ label: '$(gear) Open All Settings', description: 'Open VS Code settings for VSC Tab', id: 'openSettings' },
			], { placeHolder: 'VSC Tab Settings' });

			if (!pick) { return; }

			if (pick.id === 'setFolder') {
				const defaultUri = current !== 'Not set (uses home directory)'
					? vscode.Uri.file(current)
					: vscode.Uri.file(require('os').homedir());
				const uri = await vscode.window.showOpenDialog({
					canSelectFolders: true,
					canSelectFiles: false,
					canSelectMany: false,
					openLabel: 'Select Default Folder',
					defaultUri
				});
				if (uri && uri.length > 0) {
					await vscode.workspace.getConfiguration('vscTab').update('defaultFolder', uri[0].fsPath, vscode.ConfigurationTarget.Global);
					vscode.window.showInformationMessage(`Default folder set to: ${uri[0].fsPath}`);
				}
			} else if (pick.id === 'clearFolder') {
				await vscode.workspace.getConfiguration('vscTab').update('defaultFolder', '', vscode.ConfigurationTarget.Global);
				vscode.window.showInformationMessage('Default folder reset to home directory.');
			} else {
				vscode.commands.executeCommand('workbench.action.openSettings', 'vscTab');
			}
		}),
	);
}

export function deactivate() {}
