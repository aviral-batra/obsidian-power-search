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
		this.registerEvents()
	}

	addCommands() {
		this.addCommand({
			id: "open-power-search-results-view",
			name: "Open View",
			callback: () => this.initLeaf()
		})
	}

	registerEvents() {
		// when text is selected, it is searched
		this.registerDomEvent(document, "selectionchange", () => {this.search.debouncedSearch(document.getSelection().toString())})
		// while typing, the text is searched
		this.registerDomEvent(document, "keydown", () => this.search.debouncedSearchCurrent(true)) // TODO customise search block vs line
		// this.registerObsidianProtocolHandler("open" => ) TODO if view not open in sidebar, open protocols in new pane
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
		  	this.app.workspace.getRightLeaf(false).setViewState({
			type: SEARCH_RESULT_VIEW_TYPE,
			active: true,
		  });
		}
	}
    
}

