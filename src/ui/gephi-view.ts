import { ItemView, WorkspaceLeaf } from "obsidian";
import { GephiBridge } from "./gephi-bridge";

export const GEPHI_VIEW_TYPE = "gephi-lite-view";

export class GephiView extends ItemView {
	private getPort: () => number;
	private bridge: GephiBridge | null = null;

	constructor(leaf: WorkspaceLeaf, getPort: () => number) {
		super(leaf);
		this.getPort = getPort;
		this.navigation = true;
	}

	getViewType() {
		return GEPHI_VIEW_TYPE;
	}

	getDisplayText() {
		return "Gephi lite";
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();

		const iframe = activeDocument.createElement("iframe");
		const port = this.getPort();
		iframe.src = `http://127.0.0.1:${port}/host.html`;
		iframe.classList.add("gephi-lite-iframe");

		container.appendChild(iframe);

		// Initialize and register the bridge component
		this.bridge = new GephiBridge(iframe);
		this.addChild(this.bridge);
	}

	async onClose() {
		if (this.bridge) {
			this.removeChild(this.bridge);
			this.bridge = null;
		}
	}

	sendGraph(graph: unknown) {
		if (this.bridge) {
			this.bridge.sendGraph(graph);
		}
	}
}
