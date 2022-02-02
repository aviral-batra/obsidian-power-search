import { ItemView, WorkspaceLeaf } from "obsidian";
import { stemmer } from "stemmer";
import { SEARCH_RESULT_VIEW_TYPE } from "./constants";
import PowerSearch from "./main";


export class SearchResultView extends ItemView {
    plugin: PowerSearch;
    
    constructor(leaf: WorkspaceLeaf, plugin: PowerSearch) {
        super(leaf);
        this.plugin = plugin
    }
    
    redraw(): void {
        let rootEl = createDiv({cls: 'power-search-pane'})
        let tbarEl = createDiv({cls: "power-search-toolbar"})
        let res = rootEl.createDiv({ cls: 'power-search-results-children' })
        res.classList.add("view-content")
        this.plugin.search.results.res.forEach(e => {
            let ch = res.createDiv({ cls: 'power-search-results-child' })
            let f = ch.createDiv({ cls: 'power-search-results-card' })
            f.innerHTML = e[1]
        })
        this.containerEl.children[1].empty()
        this.containerEl.children[1].append(res)
    }
      
    
    getViewType(): string {
        return SEARCH_RESULT_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Power Search";
    }

    getIcon(): string {
        return "search";
    }
}


