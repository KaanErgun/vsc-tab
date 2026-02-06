import * as vscode from 'vscode';
import { ProjectTab } from './projectsProvider';

/**
 * Status bar'da workspace tab'larını gösterir.
 * Aktif tab vurgulanır, tıklayınca o workspace'e geçilir.
 * Tab'lar ortadan sağa-sola yayılır.
 */
export class StatusBarManager implements vscode.Disposable {
    private items: vscode.StatusBarItem[] = [];

    /** Ortadaki priority — tab'lar buradan sağa-sola yayılır */
    private static readonly CENTER_PRIORITY = 0;

    constructor(
        private getTabs: () => readonly ProjectTab[],
        private getActiveTabId: () => string | null
    ) {
        this.update();
    }

    /** Status bar item'larını yeniden oluştur */
    update(): void {
        // Eski item'ları temizle
        this.disposeItems();

        const tabs = this.getTabs();
        const activeId = this.getActiveTabId();

        if (tabs.length === 0) { return; }

        // Tab'ları ortadan sağa-sola yayılacak şekilde sırala
        // Priority yüksek = daha solda. Aktif tab ortada, diğerleri yanlarda.
        const mid = Math.floor(tabs.length / 2);

        tabs.forEach((tab, i) => {
            const isActive = tab.id === activeId;

            // Ortadan yayılma: ilk tab en yüksek priority, son tab en düşük
            const priority = StatusBarManager.CENTER_PRIORITY + (tabs.length - i);

            const item = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Left,
                priority
            );

            // Aktif tab'ı vurgula
            if (isActive) {
                item.text = `$(folder-opened) ${tab.name}`;
                item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
                item.tooltip = `● Active: ${tab.path}`;
            } else {
                item.text = `$(folder) ${tab.name}`;
                item.tooltip = `Switch to: ${tab.path}`;
            }

            item.command = {
                command: 'vsc-tab.switchTabById',
                title: 'Switch Tab',
                arguments: [tab.id]
            };

            item.show();
            this.items.push(item);
        });
    }

    private disposeItems(): void {
        this.items.forEach(item => item.dispose());
        this.items = [];
    }

    dispose(): void {
        this.disposeItems();
    }
}
