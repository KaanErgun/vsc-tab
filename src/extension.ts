import * as vscode from 'vscode';
import { ProjectsProvider, TabTreeItem } from './projectsProvider';

export function activate(context: vscode.ExtensionContext) {

	console.log('VSC Tab extension is now active!');

	const provider = new ProjectsProvider(context);

	const treeView = vscode.window.createTreeView('vsc-tab-projects', {
		treeDataProvider: provider,
		showCollapseAll: false
	});

	context.subscriptions.push(
		treeView,
		vscode.commands.registerCommand('vsc-tab.addTab', () => provider.addTab()),
		vscode.commands.registerCommand('vsc-tab.removeTab', (item: TabTreeItem) => provider.removeTab(item)),
		vscode.commands.registerCommand('vsc-tab.renameTab', (item: TabTreeItem) => provider.renameTab(item)),
		vscode.commands.registerCommand('vsc-tab.switchTab', (item: TabTreeItem) => provider.switchTab(item)),
		vscode.commands.registerCommand('vsc-tab.saveCurrentAsTab', () => provider.saveCurrentAsTab()),
		vscode.commands.registerCommand('vsc-tab.refresh', () => provider.refresh()),
	);
}

export function deactivate() {}
