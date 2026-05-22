import { Component } from "obsidian";
import { getObsidianThemeColors, observeThemeChanges } from "../utils/theme";

export class GephiBridge extends Component {
	private iframe: HTMLIFrameElement;
	private isReady = false;
	private pendingGraph: unknown = null;
	private themeObserver: MutationObserver | null = null;

	constructor(iframe: HTMLIFrameElement) {
		super();
		this.iframe = iframe;
	}

	onload() {
		super.onload();
		const win = this.iframe.ownerDocument.defaultView || window;
		
		this.registerDomEvent(win, "message", (event: MessageEvent) => {
			if (event.source === this.iframe.contentWindow) {
				const data = event.data as { type?: string } | null;
				if (data && data.type === "GEPHI_LITE_READY") {
					this.isReady = true;
					this.sendTheme();
					if (this.pendingGraph) {
						this.sendGraph(this.pendingGraph);
						this.pendingGraph = null;
					}

					this.setupThemeObserver();
				}
			}
		});
	}

	onunload() {
		if (this.themeObserver) {
			this.themeObserver.disconnect();
			this.themeObserver = null;
		}
		this.isReady = false;
		this.pendingGraph = null;
		super.onunload();
	}

	private setupThemeObserver() {
		if (this.themeObserver) {
			this.themeObserver.disconnect();
		}
		this.themeObserver = observeThemeChanges(() => {
			this.sendTheme();
		});
	}

	public sendTheme() {
		if (this.iframe.contentWindow) {
			const colors = getObsidianThemeColors();
			this.iframe.contentWindow.postMessage({
				type: "UPDATE_THEME",
				colors
			}, "*");
		}
	}

	public sendGraph(graph: unknown) {
		if (!this.isReady) {
			this.pendingGraph = graph;
			return;
		}

		if (this.iframe.contentWindow) {
			this.iframe.contentWindow.postMessage({
				type: "LOAD_GRAPH",
				graph
			}, "*");
		}
	}
}
