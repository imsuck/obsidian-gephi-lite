import { GephiLiteDriver } from "@gephi/gephi-lite-broadcast";

const channelName = "gephi-lite-obsidian";
const driver = new GephiLiteDriver(channelName);

interface LoadGraphMessage {
	type: "LOAD_GRAPH";
	graph: Parameters<GephiLiteDriver["importGraph"]>[0];
}

window.addEventListener("message", (event) => {
	const data = event.data as LoadGraphMessage | null;
	if (data && data.type === "LOAD_GRAPH") {
		driver.importGraph(data.graph).catch((err) => {
			console.error("Failed to import graph via GephiLiteDriver:", err);
		});
	}
});

async function notifyParentWhenReady() {
	let resolved = false;

	driver.on("newInstance", () => {
		if (!resolved) {
			resolved = true;
			window.parent.postMessage({ type: "GEPHI_LITE_READY" }, "*");
		}
	});

	for (let i = 0; i < 60; i++) {
		if (resolved) return;
		try {
			await driver.ping();
			if (!resolved) {
				resolved = true;
				window.parent.postMessage({ type: "GEPHI_LITE_READY" }, "*");
			}
			return;
		} catch {
			await new Promise((resolve) => window.setTimeout(resolve, 500));
		}
	}
}

void notifyParentWhenReady();
