import { Index } from "flexsearch";
import { debounce, MarkdownView } from "obsidian";
import { IncomingAnkiConnectNote, invoke } from "./anki";
import PowerSearch from "./main";
import { stripHTML } from "./utils";
import { stemmer } from "stemmer"
import { cursorTo } from "readline";

export class FuzzySearcher {
    plugin: PowerSearch
    index: Index
    results: {query: string, res: [note: IncomingAnkiConnectNote, fldText: string][]}
    notes: [note: IncomingAnkiConnectNote, fldText: string][]

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
        // create the index
        this.updateIndex(false)
    }

    

    async search(query: string) {
        if (!this._index_updating) this.debouncedRefreshIndex()
        this.results = {query: query, res: []}
        if (!query) return 
        // TODO customise options in settings
        let rs = this.index.search(query, {
            suggest: true,
        })
        if (!rs.length) {} // TODO this.results.push("No results found")
        else {
            this.results.res = rs.map(r => this.notes.filter(n => n[0].noteId == r)[0])
            // TODO highlighting
            // let queryWords = [...new Set(query.split(" ").map(w => stemmer(w)))]
            // this.results.res.forEach(r => {queryWords.forEach(qw => r[1] = this.highlight(r[1], qw))})
        }
        this.plugin.view.redraw()
    }

    async updateIndex(update: boolean = true) {
        this._index_updating = true
        let ns: IncomingAnkiConnectNote[] = await this.getNotes()
        this.notes = ns.map(n => {
            let fieldsText: string = ""
            for (let field in n.fields) {
                fieldsText += `${n.fields[field].value} |`
            }
            return [n, fieldsText]
        })
        if (update) this.notes.forEach(n => this.index.add(n[0].noteId, stripHTML(n[1])))
        else this.notes.forEach(n => this.index.update(n[0].noteId, stripHTML(n[1])))
        this._index_updating = false
    }

    _searchCurrent(block: boolean) {
        let editor = this.plugin.app.workspace.getActiveViewOfType(MarkdownView).editor
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

    // highlight(content: string, keyword: string) {
    //     const sanitizedKeyword = keyword.replace(/\W/g, '');
    //     const regexForContent = new RegExp(sanitizedKeyword, 'gi');
    //     return content.replace(regexForContent, '<span class="highlight">$&</span>');
    // }

    async getNotes(): Promise<IncomingAnkiConnectNote[]> {
        let ids: number[] = await invoke("findNotes", {query: "deck:*"})
        let notes: IncomingAnkiConnectNote[] = await invoke("notesInfo", {notes: ids})
        return notes
    }

    refreshDebounces() {
        this.debouncedRefreshIndex = debounce(this.updateIndex) 
        this.debouncedSearch = debounce((query: string) => this.search(query))
        this.debouncedSearchCurrent = debounce((block: boolean) => this._searchCurrent(block), this.plugin.settings.searchDebounce)
    }

}