import { exportGraphJson } from '../exporter';
import { GEPHI_VIEW_TYPE, GephiView } from '../ui/gephi-view';
import { IGephiPlugin } from '../plugin-interface';

export async function sendGraphToView(plugin: IGephiPlugin) {
	const graphJson = exportGraphJson(plugin.app, plugin.settings) as Record<string, unknown>;
	const leaves = plugin.app.workspace.getLeavesOfType(GEPHI_VIEW_TYPE);
	for (const leaf of leaves) {
		if (leaf.view instanceof GephiView) {
			leaf.view.sendGraph(graphJson);
		}
	}
}
