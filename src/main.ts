import { Plugin } from 'obsidian';
import { GephiView, GEPHI_VIEW_TYPE } from './gephi-view';
import { exportGraph } from './exporter';

export default class GephiLitePlugin extends Plugin {
	async onload() {
		this.registerView(
			GEPHI_VIEW_TYPE,
			(leaf) => new GephiView(leaf)
		);

		this.addCommand({
			id: 'open-gephi-view',
			name: 'Open gephi lite view',
			callback: async () => {
				await this.exportGraphAndOpenView();
			}
		});
	}

	onunload() {
	}

	async exportGraphAndOpenView() {
		await exportGraph(this.app);

		// Open view
		await this.activateView();
	}

	async activateView() {
		const { workspace } = this.app;
		let leaf = workspace.getLeaf(false);
		await leaf.setViewState({ type: GEPHI_VIEW_TYPE, active: true });
		workspace.setActiveLeaf(leaf);
	}
}
