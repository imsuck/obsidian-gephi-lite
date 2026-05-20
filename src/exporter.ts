import { App, getAllTags, TFile } from 'obsidian';
import Graph from 'graphology';
import gexf from 'graphology-gexf/browser';
import { GephiLiteSettings } from './settings';

export function buildGraph(app: App, settings: GephiLiteSettings): Graph {
	const graphType = settings.exportUndirected ? 'undirected' : 'directed';
	const graph = new Graph({ type: graphType });
	
	const resolvedLinks = app.metadataCache.resolvedLinks;
	
	// Collect all unique nodes
	const nodes = new Set<string>();
	for (const source of Object.keys(resolvedLinks)) {
		nodes.add(source);
		for (const target of Object.keys(resolvedLinks[source] || {})) {
			nodes.add(target);
		}
	}
	
	// Add nodes to graphology
	for (const node of nodes) {
		const file = app.vault.getAbstractFileByPath(node);
		const label = file ? file.name : node.split('/').pop() || node;
		
		let type = 'note';
		const extMatch = node.match(/\.([^.]+)$/);
		if (extMatch && extMatch[1]) {
			const ext = extMatch[1].toLowerCase();
			if (ext !== 'md') {
				type = ext;
			}
		}
		
		graph.addNode(node, { label, type });
	}
	
	// Add edges
	for (const source of Object.keys(resolvedLinks)) {
		const links = resolvedLinks[source];
		if (!links) continue;
		for (const target of Object.keys(links)) {
			if (!graph.hasEdge(source, target)) {
				graph.addEdge(source, target, { weight: links[target] });
			}
		}
	}
	
	// Add unresolved links
	const unresolvedLinks = app.metadataCache.unresolvedLinks;
	for (const source of Object.keys(unresolvedLinks)) {
		const links = unresolvedLinks[source];
		if (!links) continue;
		for (const target of Object.keys(links)) {
			if (!graph.hasNode(target)) {
				const label = target.split('/').pop() || target;
				graph.addNode(target, { label, type: 'unresolved' });
			}
			if (!graph.hasEdge(source, target)) {
				graph.addEdge(source, target, { weight: links[target] });
			}
		}
	}
	
	// Add tags
	if (settings.includeTags) {
		for (const source of Object.keys(resolvedLinks)) {
			const file = app.vault.getAbstractFileByPath(source);
			if (!file || !(file instanceof TFile)) continue;
			
			const cache = app.metadataCache.getFileCache(file);
			if (!cache) continue;
			
			const tags = getAllTags(cache);
			if (tags) {
				for (const tag of tags) {
					if (settings.nestedTags) {
						const tagClean = tag.replace(/^#/, '');
						const parts = tagClean.split('/');
						
						const deepestTag = `#${parts[parts.length - 1]}`;
						
						for (let i = parts.length - 1; i >= 0; i--) {
							const partTag = `#${parts[i]}`;
							if (!graph.hasNode(partTag)) {
								graph.addNode(partTag, { label: partTag, type: 'tag' });
							}
							
							if (i > 0) {
								const parentTag = `#${parts[i - 1]}`;
								if (!graph.hasNode(parentTag)) {
									graph.addNode(parentTag, { label: parentTag, type: 'tag' });
								}
								if (!graph.hasEdge(partTag, parentTag)) {
									graph.addEdge(partTag, parentTag);
								}
							}
						}
						
						if (!graph.hasEdge(source, deepestTag)) {
							graph.addEdge(source, deepestTag);
						}
					} else {
						if (!graph.hasNode(tag)) {
							graph.addNode(tag, { label: tag, type: 'tag' });
						}
						if (!graph.hasEdge(source, tag)) {
							graph.addEdge(source, tag);
						}
					}
				}
			}
		}
	}

	return graph;
}

export async function exportGraph(app: App, settings: GephiLiteSettings) {
	const graph = buildGraph(app, settings);
	
	// Export to GEXF
	const gexfString = gexf.write(graph);
	
	// Write to file inside configDir
	const configDir = app.vault.configDir;
	const exportPath = `${configDir}/gephi-lite-graph.gexf`;
	
	// Obsidian adapter operations are relative to the vault root, and configDir is relative to vault root
	await app.vault.adapter.write(exportPath, gexfString);
}

export function exportGraphJson(app: App, settings: GephiLiteSettings): unknown {
	const graph = buildGraph(app, settings);
	return graph.toJSON();
}
