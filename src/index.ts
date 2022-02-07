import { Notice } from "obsidian";
import { FuzzySearcher } from "./search";

export interface IndexNote {
    id: any;
    name: string,
    link: string;
    type: string;
    search: string;
    original: any;
}

export abstract class SearchIndex {

    searcher: FuzzySearcher
    notes: IndexNote[]
    type: string

    constructor(searcher: FuzzySearcher, type: string) {
        this.searcher = searcher
        // TODO enforce type is unique
        // TODO enforce id is unique
        this.type = type
        this.notes = []
        this.searcher.plugin._idxForSettings.push(this)
        this.setupIndex()
    }

    async setupIndex(): Promise<void> {
        if (this.searcher.plugin.settings.indexes[this.type]) {
            if (await this.loadNotes()) this.searcher.addIndex(this)
        } else  await this.searcher.removeIndex(this)
    }

    async loadNotes(): Promise<boolean> {
        this.notes = []
        try {
            let origNotes = await this.getOriginalNotes()
            this.beforeProduction(origNotes)
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
            new Notice(`Failed to load notes for the index of type: ${this.type}, see debugging log`)
            console.log(error)
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



