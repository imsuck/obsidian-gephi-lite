import { ItemView, WorkspaceLeaf } from 'obsidian';

export const GEPHI_VIEW_TYPE = 'gephi-lite-view';

export class GephiView extends ItemView {
	private getPort: () => number;
	private isReady = false;
	private pendingGraph: unknown = null;

	constructor(leaf: WorkspaceLeaf, getPort: () => number) {
		super(leaf);
		this.getPort = getPort;
		this.navigation = true;
	}

	getViewType() {
		return GEPHI_VIEW_TYPE;
	}

	getDisplayText() {
		return 'Gephi lite';
	}

	async onOpen() {
		this.isReady = false;
		this.pendingGraph = null;

		const container = this.contentEl;
		container.empty();

		const iframe = activeDocument.createElement('iframe');
		const port = this.getPort();
		iframe.src = `http://127.0.0.1:${port}/host.html`;
		iframe.classList.add('gephi-lite-iframe');

		container.appendChild(iframe);

		const win = this.containerEl.win || window;
		this.registerDomEvent(win, 'message', (event: MessageEvent) => {
			if (event.source === iframe.contentWindow) {
				const data = event.data as { type?: string } | null;
				if (data && data.type === 'GEPHI_LITE_READY') {
					this.isReady = true;
					if (this.pendingGraph) {
						this.sendGraph(this.pendingGraph);
						this.pendingGraph = null;
					}
				}
			}
		});
	}

	async onClose() {
		this.isReady = false;
		this.pendingGraph = null;
	}

	sendGraph(graph: unknown) {
		if (!this.isReady) {
			this.pendingGraph = graph;
			return;
		}

		const iframe = this.contentEl.querySelector('iframe');
		if (iframe && iframe.contentWindow) {
			iframe.contentWindow.postMessage({
				type: "LOAD_GRAPH",
				graph
			}, "*");
		}
	}
}
