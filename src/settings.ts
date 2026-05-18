import { App, PluginSettingTab, Setting } from 'obsidian';
import GephiLitePlugin from './main';

export interface GephiLiteSettings {
	includeTags: boolean;
	nestedTags: boolean;
}

export const DEFAULT_SETTINGS: GephiLiteSettings = {
	includeTags: false,
	nestedTags: false
};

export class GephiLiteSettingTab extends PluginSettingTab {
	plugin: GephiLitePlugin;

	constructor(app: App, plugin: GephiLitePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Include tags')
			.setDesc('Also include tags in the export')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeTags)
				.onChange(async (value) => {
					this.plugin.settings.includeTags = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Extract nested tags')
			.setDesc('Convert nested tags like #this/is/nested into #nested->#is->#this.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.nestedTags)
				.onChange(async (value) => {
					this.plugin.settings.nestedTags = value;
					await this.plugin.saveSettings();
				}));
	}
}
