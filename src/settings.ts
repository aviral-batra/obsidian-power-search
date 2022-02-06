import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import PowerSearch from "./main";

export interface PowerSearchSettings {
	searchDebounce: number;
	refreshDebounce: number;
	indexes: {[indexType: string]: boolean}
}

export const DEFAULT_SETTINGS: PowerSearchSettings = {
	searchDebounce: 1000,
	refreshDebounce: 2000,
	indexes: {}
}


export class PowerSearchSettingsTab extends PluginSettingTab {
	plugin: PowerSearch;

	constructor(app: App, plugin: PowerSearch) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Power Search Settings'});

		new Setting(containerEl)
			.setName('Search after time')
			.setDesc('This is the time after you stop typing/stop selecting things that the search occurs (debounce timeout)')
			.addSlider(slider => slider
				.setLimits(500, 5000, 100)
				.setValue(this.plugin.settings.searchDebounce)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.searchDebounce = value;
					await this.plugin.saveSettings();
					this.plugin.search.refreshDebounces()
				}));

		new Setting(containerEl)
		.setName('Refresh after time')
		.setDesc('This is the time after you stop searching that the index refreshes i.e. note changes + new notes + note deletions are loaded from anki into the index (debounce timeout)')
		.addSlider(slider => slider
			.setLimits(3000, 30000, 500)
			.setValue(this.plugin.settings.refreshDebounce)
			.setDynamicTooltip()
			.onChange(async (value) => {
				this.plugin.settings.refreshDebounce = value;
				await this.plugin.saveSettings();
				this.plugin.search.refreshDebounces()
			}));
		
		containerEl.createEl('h3', {text: 'Search Indexes'});
		
		this.plugin._idxForSettings.forEach(i => {
			new Setting(containerEl)
				.setName(i.type)
				.setDesc(`Add notes of type ${i.type} to the content to be searched`)
				.addToggle(toggle => toggle
					.setValue(this.plugin.settings.indexes[i.type])
					.onChange(async (value) => {
						this.plugin.settings.indexes[i.type] = value;
						await this.plugin.saveSettings();
						await i.setupIndex()
					})
				);
			})

		}
}
