import { App } from 'obsidian';
import Graph from 'graphology';
import gexf from 'graphology-gexf/browser';

export async function exportGraph(app: App) {
	const graph = new Graph({ type: 'directed' });
	
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
		graph.addNode(node, { label });
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
	
	// Export to GEXF
	const gexfString = gexf.write(graph);
	
	// Write to file inside configDir
	const configDir = app.vault.configDir;
	const exportPath = `${configDir}/gephi-lite-graph.gexf`;
	
	// Obsidian adapter operations are relative to the vault root, and configDir is relative to vault root
	await app.vault.adapter.write(exportPath, gexfString);
}
