import { Plugin } from 'obsidian';
import { SearchIndex } from 'src';
import { SEARCH_RESULT_VIEW_TYPE } from './constants';
import { AnkiIndex } from './core/anki';
import { ObsidianIndex } from './core/obs';
import { FuzzySearcher } from './search';
import { DEFAULT_SETTINGS, PowerSearchSettings, PowerSearchSettingsTab } from './settings';
import { SearchResultView } from './view';


export default class PowerSearch extends Plugin {
	settings: PowerSearchSettings;
	search: FuzzySearcher;
	indexes: SearchIndex[]

	async onload() {
		console.log("Power Search plugin loading")
		await this.loadSettings();
		this.indexes = []
		this.registerView(
			SEARCH_RESULT_VIEW_TYPE,
			(leaf) => (new SearchResultView(leaf, this))
		);
		this.addCommands()

		this.search = new FuzzySearcher(this)
		this.app.workspace.onLayoutReady(() => this.initPlugin());
	}

	initPlugin() {
		new AnkiIndex(this.search)
		new ObsidianIndex(this.search)
		this.addSettingTab(new PowerSearchSettingsTab(this.app, this));
		this.initLeaf();
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
		this.registerDomEvent(document, "keydown", () => this.search.debouncedSearchCurrent(this.settings.searchBlock)) // TODO customise search block vs line
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

	getView(): SearchResultView | null {
		for (let leaf of this.app.workspace.getLeavesOfType(SEARCH_RESULT_VIEW_TYPE)) {
			let view = leaf.view;
			if (view instanceof SearchResultView) {
			  return view
			}
		  }
		return null
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

