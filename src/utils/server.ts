/* eslint-disable obsidianmd/rule-custom-message */
import { App, FileSystemAdapter } from 'obsidian';
import * as path from 'node:path';
import * as http from 'node:http';
import sirv from 'sirv';

const DEFAULT_PORT = 26264;

export class GephiServer {
	private app: App;
	private manifestId: string;
	private server: http.Server | null = null;
	private port = 0;

	constructor(app: App, manifestId: string) {
		this.app = app;
		this.manifestId = manifestId;
	}

	async start(): Promise<number> {
		const adapter = this.app.vault.adapter;
		if (!(adapter instanceof FileSystemAdapter)) {
			throw new Error("FileSystemAdapter not available");
		}

		const pluginDir = `${this.app.vault.configDir}/plugins/${this.manifestId}`;
		const runtimeDir = `${pluginDir}/data/runtime`;
		const basePath = adapter.getBasePath();
		const absoluteRuntimeDir = path.join(basePath, runtimeDir);

		const serve = sirv(absoluteRuntimeDir, {
			dev: false,
			single: false
		});

		return new Promise<number>((resolve, reject) => {
			this.server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
				serve(req, res);
			});

			this.server.on('error', (err: Error) => {
				console.error("Gephi Lite HTTP server error:", err);
				reject(err);
			});

			this.server.listen(DEFAULT_PORT, "127.0.0.1", () => {
				this.port = DEFAULT_PORT;
				console.log(`Gephi Lite HTTP server running on http://127.0.0.1:${this.port}`);
				resolve(this.port);
			});
		});
	}

	stop() {
		if (this.server) {
			this.server.close();
			this.server = null;
			console.log("Gephi Lite server stopped");
		}
	}

	getPort(): number {
		return this.port;
	}
}
