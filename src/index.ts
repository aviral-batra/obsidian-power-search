import { Notice } from "obsidian";
import PowerSearch from "./main";
import { Searcher } from "./search";

export interface IndexNote {
    id: any;
    name: string,
    link: string;
    type: string;
    search: string;
    original: any;
}

export abstract class SearchIndex {

    plugin: PowerSearch
    searcher: Searcher

    errorShown: number;
    
    notes: IndexNote[]
    type: string

    constructor(searcher: Searcher, type: string) {
        this.searcher = searcher
        this.plugin = this.searcher.plugin
        // TODO enforce type is unique
        // TODO enforce id is unique
        this.type = type
        this.notes = []
        this.errorShown = 0
        this.plugin.indexes.push(this)
        this.setupIndex()
    }

    async setupIndex(): Promise<void> {
        if (this.plugin.settings.indexes[this.type]) {
            this.searcher.addIndexIfNotAlreadyAdded(this)
        } else await this.searcher.removeIndex(this)
    }

    async loadNotes(): Promise<boolean> {
        try {
            let origNotes = await this.getOriginalNotes()
            this.beforeProduction(origNotes)
            this.notes = []
            for (let o of origNotes) {
                this.notes.push({
                    id: this.getIdFromOriginal(o),
                    link: this.getLinkFromOriginal(o),
                    name: this.getNameFromOriginal(o),
                    type: this.type,
                    search: await this.getRawSearchDataFromOriginal(o),
                    original: o,
                })
            }
            return true
        } catch (error) {
            if (!this.notes) this.notes = []
            console.log(error)
            if (this.errorShown <= 2) {
                new Notice(`Failed to load notes for the index of type: ${this.type}, see debugging log`)
                this.errorShown += 1
            }
            return false
        }
    }

    abstract getOriginalNotes(): Promise<any[]>

    abstract getIdFromOriginal(original: any): any

    abstract getLinkFromOriginal(original: any): string

    abstract getNameFromOriginal(original: any): string

    abstract getRawSearchDataFromOriginal(original: any): Promise<string>

    abstract getDisplayFromOriginal(original: any): Promise<Element>

    // only needed if bulk load needed before production
    abstract beforeProduction(origNotes: any[]): Promise<void>


}



