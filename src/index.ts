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
        this.beforeProduction()
        let origNotes = await this.getOriginalNotes()
        for (let o of origNotes) {
            this.notes.push({
                id: this.getIdFromOriginal(o),
                type: this.type,
                search: this.getRawSearchDataFromOriginal(o),
                original: o,
            })
        }
    }

    abstract getOriginalNotes(): Promise<any[]>

    abstract getIdFromOriginal(original: any): any

    abstract getRawSearchDataFromOriginal(original: any): string
    
    abstract getDisplayFromOriginal(original: any): Promise<Element>

    // only needed if bulk load needed before production
    abstract beforeProduction(): void
    
}



