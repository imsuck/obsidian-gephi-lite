/* eslint-disable obsidianmd/rule-custom-message */
import { App, FileSystemAdapter } from 'obsidian';
import * as path from 'node:path';
import * as tar from 'tar';

// Asset imports
import gephiArchive, { RUNTIME_VERSION } from "./runtime-asset";
import hostJs from "../host-compiled.txt";

export async function initRuntime(app: App, manifestId: string) {
	const adapter = app.vault.adapter;
	if (!(adapter instanceof FileSystemAdapter)) {
		console.warn("Gephi Lite: FileSystemAdapter not available. Runtime extraction skipped.");
		return;
	}

	const pluginDir = `${app.vault.configDir}/plugins/${manifestId}`;
	const dataDir = `${pluginDir}/data`;
	const archivePath = `${dataDir}/gephi-lite.tar.gz`;
	const runtimeDir = `${dataDir}/runtime`;
	const gephiLiteDir = `${runtimeDir}/gephi-lite`;
	const versionFilePath = `${dataDir}/runtime-version.json`;

	const basePath = adapter.getBasePath();
	const absoluteArchive = path.join(basePath, archivePath);
	const absoluteGephiLiteDir = path.join(basePath, gephiLiteDir);

	let needsExtraction = true;

	// Check version mismatch
	if (await adapter.exists(versionFilePath)) {
		try {
			const versionData = JSON.parse(await adapter.read(versionFilePath)) as { version?: string };
			if (versionData.version === RUNTIME_VERSION && await adapter.exists(gephiLiteDir)) {
				needsExtraction = false;
			}
		} catch (e) {
			console.error("Gephi Lite: Failed to read runtime-version.json", e);
		}
	}

	if (needsExtraction) {
		console.log("Gephi Lite: Extracting local runtime...");
		
		// Clean existing runtime directory if present
		if (await adapter.exists(runtimeDir)) {
			await adapter.rmdir(runtimeDir, true);
		}

		// Ensure directories exist
		if (!(await adapter.exists(dataDir))) {
			await adapter.mkdir(dataDir);
		}
		if (!(await adapter.exists(runtimeDir))) {
			await adapter.mkdir(runtimeDir);
		}
		if (!(await adapter.exists(gephiLiteDir))) {
			await adapter.mkdir(gephiLiteDir);
		}

		// Write embedded tarball
		await adapter.writeBinary(archivePath, gephiArchive.buffer as ArrayBuffer);

		// Extract archive using node-tar
		await tar.x({
			file: absoluteArchive,
			cwd: absoluteGephiLiteDir,
			strip: 1
		});

		// Write version file
		await adapter.write(versionFilePath, JSON.stringify({ version: RUNTIME_VERSION }));
		console.log("Gephi Lite: Runtime extraction completed.");
	}

	// Write host.html and host.js to runtime folder
	const hostHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html, body, iframe {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      border: none;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <iframe id="gephi" src="./gephi-lite/index.html?broadcast=gephi-lite-obsidian"></iframe>
  <script src="./host.js"></script>
</body>
</html>`;

	await adapter.write(`${runtimeDir}/host.html`, hostHtml);
	await adapter.write(`${runtimeDir}/host.js`, hostJs);
}
