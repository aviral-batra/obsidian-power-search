import { MarkdownRenderer, TFile } from "obsidian"
import { SearchIndex } from "src"
import { FuzzySearcher } from "src/search"

export class ObsidianIndex extends SearchIndex {

    fileTexts: {[path: string]: string}

    constructor(searcher: FuzzySearcher) {
        super(searcher, "Obsidian File") 
        this.fileTexts = {}
    }

    async getOriginalNotes(): Promise<TFile[]> {
        return this.searcher.plugin.app.vault.getMarkdownFiles()
    }

    getIdFromOriginal(original: TFile) {
        return original.path
    }

    async getRawSearchDataFromOriginal(original: TFile): Promise<string> {
        return this.fileTexts[original.path]
    }

    async getDisplayFromOriginal(original: TFile): Promise<Element> {
        let el = createDiv({cls: "power-search-results-card"})
        MarkdownRenderer.renderMarkdown(this.fileTexts[original.path], el, original.path, this.searcher.plugin.getView())
        return el
    }

    async beforeProduction(origNotes: TFile[]): Promise<void> {
        for (let n of origNotes) {
            this.fileTexts[n.path] = await this.searcher.plugin.app.vault.cachedRead(n)
        }
    }
    
}
