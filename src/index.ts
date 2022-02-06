import { FuzzySearcher } from "./search";

export abstract class SearchIndex {

    searcher: FuzzySearcher
    notes: {id: any, type: string, search: string, original: any}[]
    type: string

    constructor(searcher: FuzzySearcher, type: string) {
        this.searcher = searcher
        this.type = type
        this.notes = []
        this.loadNotes().then(() => this.searcher.addIndex(this))
    }

    async loadNotes() {
        this.notes = []
        let origNotes = await this.getOriginalNotes()
        this.beforeProduction(origNotes)
        for (let o of origNotes) {
            this.notes.push({
                id: this.getIdFromOriginal(o),
                type: this.type,
                search: await this.getRawSearchDataFromOriginal(o),
                original: o,
            })
        }
    }

    abstract getOriginalNotes(): Promise<any[]>

    abstract getIdFromOriginal(original: any): any

    abstract getRawSearchDataFromOriginal(original: any): Promise<string>
    
    abstract getDisplayFromOriginal(original: any): Promise<Element>

    // only needed if bulk load needed before production
    abstract beforeProduction(origNotes: any[]): Promise<void>
    
}



