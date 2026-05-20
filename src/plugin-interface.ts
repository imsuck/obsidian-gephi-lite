import { Plugin } from 'obsidian';
import { GephiLiteSettings } from './settings';

export interface IGephiPlugin extends Plugin {
	settings: GephiLiteSettings;
	saveSettings(): Promise<void>;
}
