import { ItemView, WorkspaceLeaf } from "obsidian";
import { SEARCH_RESULT_VIEW_TYPE } from "./constants";
import PowerSearch from "./main";


export class SearchResultView extends ItemView {
    plugin: PowerSearch;
    
    constructor(leaf: WorkspaceLeaf, plugin: PowerSearch) {
        super(leaf);
        this.plugin = plugin
    }
    
    redraw(): void {
        let rootEl = createDiv({cls: 'nav-folder mod-root'})
        let tbarEl = createDiv({cls: "titlebar"})
        let errorsEl = rootEl.createDiv({ cls: 'nav-folder-children' })
        this.plugin.search.results.forEach(e => {
            let f = errorsEl.createDiv({ cls: 'nav-file' })
            let ft = f.createDiv({ cls: 'nav-file-title'});
            ft.innerHTML = e
        })
        this.containerEl.empty()
        this.containerEl.append(rootEl)
    }
    
    getViewType(): string {
        return SEARCH_RESULT_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Power Search";
    }
    
}