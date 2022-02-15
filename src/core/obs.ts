import { MarkdownRenderer, TAbstractFile, TFile, Vault } from "obsidian"
import { SearchIndex } from "src"
import { Searcher } from "src/search"

export class ObsidianIndex extends SearchIndex {

    fileTexts: {[path: string]: string};
    modifiedFiles: TFile[]
    firstLoad: boolean;

    constructor(searcher: Searcher) {
        super(searcher, "Obsidian File") 
        this.fileTexts = {}
        this.modifiedFiles = []
        this.firstLoad = true
        this.plugin.app.vault.on("modify", (f) => this.onModify(f))
        this.plugin.app.vault.on("delete", (f) => this.onDelete(f))
        this.plugin.app.vault.on("create", (f) => this.onCreate(f))
    }

    onModify(f: TAbstractFile) {
        if (f instanceof TFile && this.modifiedFiles.indexOf(f) == -1) this.modifiedFiles.push(f)
    }

    onDelete(f: TAbstractFile) {
        if (f instanceof TFile && f.path in this.fileTexts) delete this.fileTexts[f.path]
    }

    async onCreate(f: TAbstractFile) {
        if (f instanceof TFile) this.fileTexts[f.path] = await this.plugin.app.vault.cachedRead(f)
    }

    async getOriginalNotes(): Promise<TFile[]> {
        return this.plugin.app.vault.getMarkdownFiles()
    }

    getNameFromOriginal(original: TFile): string {
        return original.name
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
        if (this.firstLoad) for (let n of origNotes) {
            this.fileTexts[n.path] = await this.plugin.app.vault.read(n)
        } else {
            for (let f of this.modifiedFiles) this.fileTexts[f.path] = await this.plugin.app.vault.cachedRead(f)
        }
        this.firstLoad = false
        this.modifiedFiles = []
    }

    getLinkFromOriginal(original: TFile): string {
        let vaultName = this.plugin.app.vault.getName()
        return "obsidian://open?vault=" + encodeURIComponent(vaultName) + String.raw`&file=` + encodeURIComponent(original.path)
    }

    
}
