import { Plugin } from 'obsidian';
import { IGephiPlugin } from '../plugin-interface';
import { exportGraphAndOpenView } from './open-view';
import { sendGraphToView } from './refresh-graph';

export function registerCommands(plugin: Plugin & IGephiPlugin) {
	plugin.addCommand({
		id: 'open-gephi-view',
		name: 'Open graph view',
		callback: async () => {
			await exportGraphAndOpenView(plugin);
		}
	});

	plugin.addCommand({
		id: 'refresh-gephi-graph',
		name: 'Refresh graph',
		callback: async () => {
			await sendGraphToView(plugin);
		}
	});
}
