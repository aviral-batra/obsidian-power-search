import { ItemView, WorkspaceLeaf } from "obsidian";
import { SEARCH_RESULT_VIEW_TYPE } from "./constants";
import PowerSearch from "./main";


export class SearchResultView extends ItemView {
    plugin: PowerSearch;
    
    constructor(leaf: WorkspaceLeaf, plugin: PowerSearch) {
        super(leaf);
        this.plugin = plugin
    }
    
    async redraw(): Promise<void> {
        let rootEl = createDiv({cls: 'power-search-pane'})
        let tbarEl = createDiv({cls: "power-search-toolbar"})
        let res = rootEl.createDiv({ cls: 'power-search-results-children' })
        res.classList.add("view-content")
        let idxs = this.plugin.search.indexes
        if (!Object.keys(idxs).length) res.createDiv({cls: "power-search-results-type", text: "No indexes activated! They can be activated in the Power Search settings tab."});
        for (let e of this.plugin.search.results.res) {
            let ch = res.createDiv({ cls: 'power-search-results-child' })
            ch.createDiv({ 
                cls: "power-search-results-type",
                text: `Type: ${e.type}` 
            })
            ch.append(e.display)
            // f.onerror = function() {} // TODO fix errors
        }
        // finishRenderMath()
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


