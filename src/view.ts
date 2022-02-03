import { ItemView, renderMath, WorkspaceLeaf } from "obsidian";
import { invoke } from "./anki";
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
        for (let e of this.plugin.search.results.res) {
            let ch = res.createDiv({ cls: 'power-search-results-child' })
            let f = ch.createDiv({ cls: 'power-search-results-card' })
            f.innerHTML = e[1]
            // f.onerror = function() {} // TODO fix errors
            this.renderMathForNote(f)
            await this.fixImagesForNote(f)
        }
        // finishRenderMath()
        this.containerEl.children[1].empty()
        this.containerEl.children[1].append(res)
    }

    renderMathForNote(el: Element) {
        let str = el.innerHTML
        let startDelimIndex = str.indexOf("\\\(")
        let endDelimIndex = str.indexOf("\\\)")
        let startIndex = 0 
        let strList: string[] = []
        while (startDelimIndex != -1 && endDelimIndex != -1) {
            strList.push(str.substring(startIndex, startDelimIndex))
            let substring = str.substring(startDelimIndex + 2, endDelimIndex)
            strList.push(renderMath(substring, true).innerHTML)
            startIndex = endDelimIndex + 2
            startDelimIndex = str.indexOf("\\\(", startIndex)
            endDelimIndex = str.indexOf("\\\)", startIndex)
        }
        strList.push(str.substring(startIndex))
        el.innerHTML = strList.join("")
    }

    async fixImagesForNote(el: Element) {
        let imgs = Array.from(el.getElementsByTagName("img"))
        for (let img of imgs) {
            let imgBase64 = await invoke("retrieveMediaFile", {filename: img.alt})
            img.src = `data:image/png;base64, ${imgBase64}`
        };
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


