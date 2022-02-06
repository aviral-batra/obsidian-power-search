import { Index } from "flexsearch";
import { debounce, MarkdownView } from "obsidian";
import PowerSearch from "./main";
import { stemmer } from "stemmer"
import { SearchIndex } from "src";

export class FuzzySearcher {
    plugin: PowerSearch
    index: Index
    results: {query: string, res: {type: string, highlightedSearch: string, display: Element}[]}
    notes: {id: any, type: string, search: string, original: any, index: SearchIndex}[]
    indexes: SearchIndex[]

    debouncedRefreshIndex: Function
    debouncedSearch: Function
    debouncedSearchCurrent: Function

    _index_updating: boolean;

    constructor(plugin: PowerSearch) {
        this.plugin = plugin
        this.refreshDebounces()
        this.index = new Index({
            stemmer: stemmer,
            // TODO add matcher
            // TODO add custom stop word filter
        })
        this.indexes = []
        this.notes = []
    }

    async search(query: string) {
        if (!this._index_updating) this.debouncedRefreshIndex()
        this.results = {query: query, res: []}
        if (!query) return 
        // TODO customise options in settings
        let rs = this.index.search(query, {
            suggest: true,
        })
        if (!(rs || rs.length)) {} // TODO this.results.push("No results found")
        else {
            for (let r of rs) {
                let n = this.notes.filter(n => n.id == r)[0]
                this.results.res.push({
                    type: n.type,
                    highlightedSearch: this.highlightSearch(n.search, query),
                    display: await n.index.getDisplayFromOriginal(n.original)
                })
            }
        }
        let view = this.plugin.getView()
        await view.redraw() // TODO deal with null view
    }

    removeIndex(index: SearchIndex) {
        // TODO - for now just reload 
    }

    addIndex(index: SearchIndex) {
        if (!this.indexes.includes(index)) { 
            this.indexes.push(index)
            this.updateIndex(false, index)
        }
    }

    highlightSearch(searchText: string, query: string) {
        return searchText
        // TODO
        // let queryWords = [...new Set(query.split(" ").map(w => stemmer(w)))]
        // this.results.res.forEach(r => {queryWords.forEach(qw => r[1] = this.highlight(r[1], qw))})
    }

        // highlight(content: string, keyword: string) {
    //     const sanitizedKeyword = keyword.replace(/\W/g, '');
    //     const regexForContent = new RegExp(sanitizedKeyword, 'gi');
    //     return content.replace(regexForContent, '<span class="highlight">$&</span>');
    // }


    async updateIndex(update: boolean = true, idx: "all" | SearchIndex = "all") {
        this._index_updating = true
        if (!(idx == "all")) await this.doUpdateIndex(update, idx)
        else {
            for (let i of this.indexes) {
                await this.doUpdateIndex(update, i)
            }
        }
        this._index_updating = false
    }

    async doUpdateIndex(update: boolean, idx: SearchIndex) {
        await idx.loadNotes()
        if (update) idx.notes.forEach(n => this.index.add(n.id, n.search))
            else {
                idx.notes.forEach(n => {
                    this.index.update(n.id, n.search)
                    let searchNote: any = n
                    searchNote["index"] = idx
                    this.notes.push(searchNote)
                })
            }
    }

    _searchCurrent(block: boolean) {
        let mv = this.plugin.app.workspace.getActiveViewOfType(MarkdownView)
        if (mv) {
            let editor = mv.editor
            if (block) { // TODO this is clunky? find another way
                let query: string = ""
                let origLineNo = editor.getCursor().line 
                let lineCount = editor.lineCount()
                let lineNo = origLineNo
                let line = editor.getLine(lineNo)
                // get lines before cursor and add them to start of query
                while (line.length != 0) {
                    line = editor.getLine(lineNo)
                    if (line) query = line + ` ${query}`
                    if (lineNo == 0) break
                    lineNo -= 1
                }

                // get lines after cursor and add them to end of query
                lineNo = origLineNo + 1
                line = editor.getLine(lineNo)
                while (line) {
                    line = editor.getLine(lineNo)
                    if (line) query += ` ${line}`
                    if (lineNo == (lineCount - 1)) break
                    lineNo += 1
                }
                this.search(query)
            }
            else this.search(editor.getLine(editor.getCursor().line))
        }
    }

    refreshDebounces() {
        this.debouncedRefreshIndex = debounce(this.updateIndex, this.plugin.settings.refreshDebounce) 
        this.debouncedSearch = debounce((query: string) => this.search(query), this.plugin.settings.searchDebounce)
        this.debouncedSearchCurrent = debounce((block: boolean) => this._searchCurrent(block), this.plugin.settings.searchDebounce)
    }

}