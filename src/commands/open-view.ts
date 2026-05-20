import { App } from 'obsidian';
import { exportGraph } from '../exporter';
import { GEPHI_VIEW_TYPE } from '../ui/gephi-view';
import { sendGraphToView } from './refresh-graph';
import { IGephiPlugin } from '../plugin-interface';

export async function activateView(app: App) {
	const { workspace } = app;
	let leaf = workspace.getLeaf(false);
	await leaf.setViewState({ type: GEPHI_VIEW_TYPE, active: true });
	workspace.setActiveLeaf(leaf);
}

export async function exportGraphAndOpenView(plugin: IGephiPlugin) {
	await exportGraph(plugin.app, plugin.settings);
	await activateView(plugin.app);
	void sendGraphToView(plugin);
}
