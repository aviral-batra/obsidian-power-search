import { debounce, ItemView, WorkspaceLeaf } from "obsidian";
import { SEARCH_RESULT_VIEW_TYPE } from "./constants";
import PowerSearch from "./main";


export class SearchResultView extends ItemView {
    page: number
    plugin: PowerSearch;
    debouncedRedraw: Function;
    
    constructor(leaf: WorkspaceLeaf, plugin: PowerSearch) {
        super(leaf);
        this.plugin = plugin
        this.debouncedRedraw = debounce(() => this.redraw(), 1000)
        this.redraw()
    }

    async redraw() {
        this.page = 1
        await this._redraw()
    }
    
    async _redraw(): Promise<void> {

        let arrowEl = createDiv({cls: "power-search-arrow-bar"})
        let leftArrow = arrowEl.createEl("a")
        leftArrow.innerHTML = "&laquo; "
        leftArrow.classList.add("power-search-arrow-bar-item")
        leftArrow.addEventListener("click", () => this.prevPage())
        let pageNo = arrowEl.createSpan()
        pageNo.innerHTML = this.page.toString()
        pageNo.classList.add("power-search-arrow-bar-item")
        let rightArrow = arrowEl.createEl("a")
        rightArrow.classList.add("power-search-arrow-bar-item")
        rightArrow.innerHTML = " &raquo;"
        rightArrow.addEventListener("click", () => this.nextPage())

        let res = createDiv({ cls: 'power-search-results-children' })
        let idxs = this.plugin.search.indexes
        if (!Object.keys(idxs).length) res.createDiv({cls: "power-search-results-type", text: "No indexes activated! They can be activated in the Power Search settings tab."})
        else if (this.plugin.search.results.res.length == 0) res.createDiv({cls: "power-search-results-type", text: "No results found! Start highlighting text/typing to try to find results or check for any errors in loading indexes (in a notice that pops up a few times or the console)"});
        for (let e of this.plugin.search.results.res) {
            let ch = res.createDiv({ cls: 'power-search-results-child' })
            let headEl = ch.createDiv({ cls: "power-search-results-type" })
            headEl.innerHTML = `<a href="${e.link}">${e.name}</a> Type: ${e.type}`
            ch.append(e.display)
            // f.onerror = function() {} // TODO fix errors
        }

        this.containerEl.children[1].empty()
        this.containerEl.children[1].append(arrowEl)
        this.containerEl.children[1].append(res)
    }

    nextPage() {
        if (this.plugin.search.results.res.length) {
            this.page += 1
            let off = (this.page - 1) * this.plugin.settings.pageSize
            this.plugin.search._search(this.plugin.search.results.query, off, true)
        }
    }

    prevPage() {
        if (this.page != 1) {
            this.page -= 1
            let off = (this.page - 1) * this.plugin.settings.pageSize
            this.plugin.search._search(this.plugin.search.results.query, off, true)
        }
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


