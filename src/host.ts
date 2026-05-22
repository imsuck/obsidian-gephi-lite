// iframe doesn't have activeDocument nor have access to styles.css
/* eslint-disable obsidianmd/prefer-active-doc, obsidianmd/no-forbidden-elements */

import { GephiLiteDriver } from "@gephi/gephi-lite-broadcast";
import type { ObsidianThemeColors } from "./utils/theme";

const channelName = "gephi-lite-obsidian";
const driver = new GephiLiteDriver(channelName);

interface LoadGraphMessage {
	type: "LOAD_GRAPH";
	graph: Parameters<GephiLiteDriver["importGraph"]>[0];
}

interface UpdateThemeMessage {
	type: "UPDATE_THEME";
	colors: ObsidianThemeColors;
}

let cachedColors: ObsidianThemeColors | null = null;

function extractRGB(rgbString: string): string {
	// rgbString is expected to be like "rgb(255, 255, 255)" or "rgba(255, 255, 255, 1)"
	const match = rgbString.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
	if (match && match[1] !== undefined && match[2] !== undefined && match[3] !== undefined) {
		return `${match[1]},${match[2]},${match[3]}`;
	}
	return "255,255,255";
}

function applyThemeToElement(root: HTMLElement, colors: ObsidianThemeColors) {
	// Toggle light/dark theme attribute for bootstrap components inside the iframe
	root.setAttribute("data-bs-theme", colors.isDark ? "dark" : "light");

	const setVar = (name: string, value: string) => {
		root.style.setProperty(name, value);
		root.style.setProperty(`${name}-rgb`, extractRGB(value));
	};

	// Core GL variables
	setVar("--gl-body-bg", colors.bgPrimary);
	setVar("--gl-container-high-bg", colors.bgPrimary);
	setVar("--gl-container-highest-bg", colors.base20);
	setVar("--gl-container-bg", colors.bgSecondary);

	setVar("--gl-body-color", colors.textNormal);
	setVar("--gl-container-color", colors.textNormal);
	setVar("--gl-component-color", colors.textNormal);

	setVar("--gl-body-muted-color", colors.textMuted);
	setVar("--gl-container-muted-color", colors.textMuted);

	setVar("--gl-body-border-color", colors.border);
	setVar("--gl-container-border-color", colors.border);
	setVar("--gl-component-border-color", colors.border);

	setVar("--gl-table-border-color", colors.border);
	setVar("--gl-table-column-header-editable-bg", colors.base20);
	setVar("--gl-table-column-header-non-editable-bg", colors.base20);

	setVar("--gl-component-bg", colors.interactive);
	setVar("--gl-error", colors.error);

	// Bootstrap variable mappings (mirroring GL variables)
	setVar("--bs-body-bg", colors.bgPrimary);
	setVar("--bs-body-color", colors.textNormal);
	setVar("--bs-body-color-rgb", extractRGB(colors.textNormal));
	setVar("--bs-body-bg-rgb", extractRGB(colors.bgPrimary));
	setVar("--bs-emphasis-color", colors.accentHex);
	setVar("--bs-emphasis-color-rgb", colors.accentRgb);
	setVar("--bs-secondary-color", `rgba(${extractRGB(colors.textNormal)}, .75)`);
	setVar("--bs-secondary-bg", colors.bgSecondary);
	setVar("--bs-tertiary-color", `rgba(${extractRGB(colors.textNormal)}, .5)`);

	const style = document.createElement("style");
	style.textContent = `
		::-webkit-scrollbar {
			width: 8px;
			height: 8px;
		}
		::-webkit-scrollbar-thumb {
			background-color: ${colors.border};
			border-radius: 4px;
		}
		::-webkit-scrollbar-track {
			background-color: transparent;
		}
	`;
	root.appendChild(style);
}

window.addEventListener("message", (event) => {
	const data = event.data as LoadGraphMessage | UpdateThemeMessage | null;
	if (!data) return;

	if (data.type === "LOAD_GRAPH") {
		driver.importGraph(data.graph).catch((err) => {
			console.error("Failed to import graph via GephiLiteDriver:", err);
		});
	} else if (data.type === "UPDATE_THEME") {
		cachedColors = data.colors;
		const iframe = document.getElementById("gephi") as HTMLIFrameElement | null;
		const root = iframe?.contentDocument?.documentElement;
		if (root) {
			applyThemeToElement(root, cachedColors);
		}
	}
});

// Watch for the inner iframe loading or reloading to reapply the theme
const iframe = document.getElementById("gephi") as HTMLIFrameElement | null;
if (iframe) {
	iframe.addEventListener("load", () => {
		if (cachedColors) {
			const root = iframe.contentDocument?.documentElement;
			if (root) {
				applyThemeToElement(root, cachedColors);
			}
		}
	});
}

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
