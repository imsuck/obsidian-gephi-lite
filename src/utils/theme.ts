export interface ObsidianThemeColors {
	bgPrimary: string;
	bgSecondary: string;
	textNormal: string;
	textMuted: string;
	border: string;
	interactive: string;
	error: string;
	isDark: boolean;
	accentHex: string; // Hex representation of accent color
	accentRgb: string; // "r,g,b" representation for --bs-emphasis-color-rgb
	base00: string;
	base05: string;
	base10: string;
	base20: string;
	base25: string;
	base30: string;
	base35: string;
	base40: string;
	base50: string;
	base60: string;
	base70: string;
	base100: string;
}

export function getObsidianThemeColors(): ObsidianThemeColors {
	const doc = activeDocument;
	const getResolvedColor = (varName: string): string => {
		const temp = doc.createElement("div");
		temp.style.color = `var(${varName})`;
		doc.body.appendChild(temp);
		const resolved = getComputedStyle(temp).color;
		doc.body.removeChild(temp);
		return resolved || "rgb(255, 255, 255)";
	};

	const hslToHex = (h: number, s: number, l: number): string => {
		s /= 100;
		l /= 100;
		const k = (n: number) => (n + h / 30) % 12;
		const a = s * Math.min(l, 1 - l);
		const f = (n: number) => {
			const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, "0");
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	};

	// Retrieve accent HSL values from CSS custom properties
	const rootStyles = getComputedStyle(doc.documentElement);
	const accentH = parseFloat(rootStyles.getPropertyValue("--accent-h")) || 254;
	const accentS = parseFloat(rootStyles.getPropertyValue("--accent-s")) || 80;
	const accentL = parseFloat(rootStyles.getPropertyValue("--accent-l")) || 68;
	const accentHex = hslToHex(accentH, accentS, accentL);
	// Convert hex to rgb string "r,g,b"
	const hexToRgb = (hex: string) => {
		const clean = hex.replace("#", "");
		const bigint = parseInt(clean, 16);
		const r = (bigint >> 16) & 255;
		const g = (bigint >> 8) & 255;
		const b = bigint & 255;
		return `${r},${g},${b}`;
	};
	const accentRgb = hexToRgb(accentHex);

	return {
		bgPrimary: getResolvedColor("--background-primary"),
		bgSecondary: getResolvedColor("--background-secondary"),
		textNormal: getResolvedColor("--text-normal"),
		textMuted: getResolvedColor("--text-muted"),
		border: getResolvedColor("--background-modifier-border"),
		interactive: getResolvedColor("--interactive-normal"),
		error: getResolvedColor("--text-error"),
		isDark: doc.body.classList.contains("theme-dark"),
		accentHex,
		accentRgb,
		base00: getResolvedColor("--color-base-00"),
		base05: getResolvedColor("--color-base-05"),
		base10: getResolvedColor("--color-base-10"),
		base20: getResolvedColor("--color-base-20"),
		base25: getResolvedColor("--color-base-25"),
		base30: getResolvedColor("--color-base-30"),
		base35: getResolvedColor("--color-base-35"),
		base40: getResolvedColor("--color-base-40"),
		base50: getResolvedColor("--color-base-50"),
		base60: getResolvedColor("--color-base-60"),
		base70: getResolvedColor("--color-base-70"),
		base100: getResolvedColor("--color-base-100"),
	};
}

export function observeThemeChanges(callback: () => void): MutationObserver {
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.attributeName === "class") {
				callback();
				break;
			}
		}
	});

	observer.observe(activeDocument.body, {
		attributes: true,
		attributeFilter: ["class"],
	});

	return observer;
}
