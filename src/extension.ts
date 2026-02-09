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
		vscode.commands.registerCommand('vsc-tab.openSettings', () => {
			vscode.commands.executeCommand('workbench.action.openSettings', 'vscTab');
		}),
	);
}

export function deactivate() {}
