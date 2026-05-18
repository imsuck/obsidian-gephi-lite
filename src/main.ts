import { Plugin } from 'obsidian';
import { GephiView, GEPHI_VIEW_TYPE } from './gephi-view';
import { exportGraph } from './exporter';
import { GephiLiteSettings, DEFAULT_SETTINGS, GephiLiteSettingTab } from './settings';

export default class GephiLitePlugin extends Plugin {
	settings!: GephiLiteSettings;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new GephiLiteSettingTab(this.app, this));

		this.registerView(
			GEPHI_VIEW_TYPE,
			(leaf) => new GephiView(leaf)
		);

		this.addCommand({
			id: 'open-gephi-view',
			name: 'Open graph view',
			callback: async () => {
				await this.exportGraphAndOpenView();
			}
		});
	}

	onunload() {
	}

	async exportGraphAndOpenView() {
		await exportGraph(this.app, this.settings);

		// Open view
		await this.activateView();
	}

	async activateView() {
		const { workspace } = this.app;
		let leaf = workspace.getLeaf(false);
		await leaf.setViewState({ type: GEPHI_VIEW_TYPE, active: true });
		workspace.setActiveLeaf(leaf);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as GephiLiteSettings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
