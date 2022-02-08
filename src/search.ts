import { Index } from "flexsearch";
import { debounce, MarkdownView } from "obsidian";
import PowerSearch from "./main";
import { stemmer } from "stemmer"
import { IndexNote, SearchIndex } from "src";

interface SearchNote extends IndexNote {
    index: SearchIndex
}

export class FuzzySearcher {
    plugin: PowerSearch
    index: Index
    results: {query: string, res: {id: any, name: string, link: string, type: string, highlightedSearch: string, display: Element}[]}
    notes: SearchNote[]
    indexes: {[type: string]: SearchIndex}

    debouncedRefreshIndex: Function
    debouncedSearch: Function
    debouncedSearchCurrent: Function
    _debouncedSearch: Function
    _debouncedSearchCurrent: Function

    _index_updating: boolean;

    constructor(plugin: PowerSearch) {
        this.plugin = plugin
        this.refreshDebounces()
        this.index = new Index({
            stemmer: stemmer,
            // TODO add matcher
            // TODO add custom stop word filter
        })
        this.indexes = {}
        this.notes = []
    }

    async search(query: string) {
        if (!this._index_updating) this.debouncedRefreshIndex()
        await this._search(query)
    }

    async _search(query: string, offset: number = 0, paginate: boolean = false) {
        this.results = {query: query, res: []}
        if (!query) return 
        // TODO customise options in settings
        let rs = this.index.search(query,
            {
                limit: this.plugin.settings.pageSize,
                offset: offset,
                suggest: true,
            }
        )
        if (!(rs || rs.length)) {} // TODO this.results.push("No results found")
        else {
            for (let r of rs) {
                let n = this.notes.filter(n => n.id == r)[0]
                this.results.res.push({
                    id: n.id, 
                    name: n.name,
                    link: n.link,
                    type: n.type,
                    highlightedSearch: this.highlightSearch(n.search, query),
                    display: await n.index.getDisplayFromOriginal(n.original),
                })
            }
        }
        let view = this.plugin.getView()
        if (!paginate) await view.redraw() // TODO deal with null view
        else if (rs.length > 0) await view._redraw()
    }

    async removeIndex(idx: SearchIndex) {
        await idx.loadNotes()
        idx.notes.forEach(n => this.index.remove(n.id))
        delete this.indexes[idx.type]
    }

    addIndex(index: SearchIndex) {
        if (!(index.type in this.indexes)) { 
            this.indexes[index.type] = index
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
        if (!(idx == "all")) await this._doUpdateIndex(update, idx)
        else {
            for (let i in this.indexes) {
                await this._doUpdateIndex(update, this.indexes[i])
            }
        }
        this._refreshNotesList()
        this._index_updating = false
    }

    async _doUpdateIndex(update: boolean, idx: SearchIndex) {
        await idx.loadNotes()
        if (update) idx.notes.forEach(n => this.index.add(n.id, n.search))
        else {
            idx.notes.forEach(n => {
                this.index.update(n.id, n.search)
            })
        }
    }

    _refreshNotesList() {
        this.notes = []
        for (let i in this.indexes) {
            this.indexes[i].notes.forEach(n => {
                let searchNote: SearchNote = Object.assign({index: this.indexes[i]}, n)
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

    _debRefreshIndexThenCall(func: CallableFunction) {
        function new_function(args: any) {
            if (!this._index_updating) this.debouncedRefreshIndex()
            func(args)
        }
        return new_function
    }

    refreshDebounces() {
        this.debouncedRefreshIndex = debounce(this.updateIndex, this.plugin.settings.refreshDebounce, true) 

        this._debouncedSearch = debounce((query: string) => this.search(query), this.plugin.settings.searchDebounce, true)
        this._debouncedSearchCurrent = debounce((block: boolean) => this._searchCurrent(block), this.plugin.settings.searchDebounce, true)

        this.debouncedSearch = this._debRefreshIndexThenCall(this._debouncedSearch)
        this.debouncedSearchCurrent = this._debRefreshIndexThenCall(this._debouncedSearchCurrent)
    }

}