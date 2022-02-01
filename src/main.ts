import { Plugin } from 'obsidian';
import { SEARCH_RESULT_VIEW_TYPE } from './constants';
import { FuzzySearcher } from './search';
import { DEFAULT_SETTINGS, PowerSearchSettings, PowerSearchSettingsTab } from './settings';
import { SearchResultView } from './view';


export default class PowerSearch extends Plugin {
	settings: PowerSearchSettings;
	view: SearchResultView;
	search: FuzzySearcher;

	async onload() {
		console.log("Power Search plugin loading")
		await this.loadSettings();
		console.log(this.app)

		this.registerView(
			SEARCH_RESULT_VIEW_TYPE,
			(leaf) => (this.view = new SearchResultView(leaf, this))
		);


		this.app.workspace.onLayoutReady(() => this.initPlugin());
	}

	initPlugin() {
		this.search = new FuzzySearcher(this)
		this.addSettingTab(new PowerSearchSettingsTab(this.app, this));
		this.initLeaf();
		this.addCommands()
	}

	addCommands() {
		this.addCommand({
			id: 'power-search-search-selection',
			name: 'Search Selection',
			callback: () => this.search.searchSelection()
		});
	}

	onunload() {
		console.log("Power Search plugin unloading")
		this.app.workspace.detachLeavesOfType(SEARCH_RESULT_VIEW_TYPE);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	initLeaf(): void {
		let leaves = this.app.workspace.getLeavesOfType(SEARCH_RESULT_VIEW_TYPE)
		if (leaves.length) {
		} else {
		  	this.app.workspace.getRightLeaf(true).setViewState({
			type: SEARCH_RESULT_VIEW_TYPE,
			active: true,
		  });
		}
	}
    
}

