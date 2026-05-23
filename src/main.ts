import { Plugin } from 'obsidian';
import { GephiView, GEPHI_VIEW_TYPE } from './ui/gephi-view';
import { GephiLiteSettings, DEFAULT_SETTINGS, GephiLiteSettingTab } from './settings';
import { initRuntime } from './utils/runtime';
import { GephiServer } from './utils/server';
import { registerCommands } from './commands';
import { IGephiPlugin } from './plugin-interface';

export default class GephiLitePlugin extends Plugin implements IGephiPlugin {
	settings!: GephiLiteSettings;
	private serverManager!: GephiServer;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new GephiLiteSettingTab(this.app, this));

		// NOTE: might want to lazy load the server instead
		this.serverManager = new GephiServer(this.app, this.manifest.id);
		await initRuntime(this.app, this.manifest.id);
		await this.serverManager.start();

		this.registerView(
			GEPHI_VIEW_TYPE,
			(leaf) => new GephiView(leaf, () => this.serverManager.getPort())
		);

		registerCommands(this);
	}

	onunload() {
		if (this.serverManager) {
			this.serverManager.stop();
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as GephiLiteSettings;
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
