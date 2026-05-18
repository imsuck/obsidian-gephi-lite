import { ItemView, WorkspaceLeaf } from 'obsidian';

export const GEPHI_VIEW_TYPE = 'gephi-lite-view';

export class GephiView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.navigation = true;
	}

	getViewType() {
		return GEPHI_VIEW_TYPE;
	}

	getDisplayText() {
		return 'Gephi lite';
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();

		const iframe = activeDocument.createElement('iframe');
		iframe.src = 'https://lite.gephi.org/';
		iframe.classList.add('gephi-lite-iframe');

		container.appendChild(iframe);
	}

	async onClose() {
		// Nothing to clean up.
	}
}
