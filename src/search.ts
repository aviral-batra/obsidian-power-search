import * as fuzzysort from "fuzzysort";
import { debounce, MarkdownView } from "obsidian";
import { IncomingAnkiConnectNote, invoke } from "./anki";
import PowerSearch from "./main";
import { stripHTML } from "./utils";


export class FuzzySearcher {
    plugin: PowerSearch
    index: { preparedFields: Fuzzysort.Prepared; note: IncomingAnkiConnectNote; }[]
    results: string[]
    debouncedRefreshIndex: Function;

    constructor(plugin: PowerSearch) {
        this.plugin = plugin
        this.debouncedRefreshIndex = debounce(this.refreshIndex, 4000)
    }

    searchSelection() {
        this.results = []
        let editor = this.plugin.app.workspace.getActiveViewOfType(MarkdownView).editor
        if (editor.somethingSelected()) {
            this.search(editor.getSelection())
        } else {
            this.results.push("No selections made")
        }
    }

    async search(query: string) {
        if (!this.index) this.index = await this.refreshIndex()
        else this.debouncedRefreshIndex() 
        let targets = this.index.map(i => i.preparedFields)
        let fsoptions: Fuzzysort.Options = {
            limit: 100,
            threshold: -10000
        }
        // TODO customise options in settings
        let rs = await fuzzysort.goAsync(query, targets, fsoptions)
        if (rs.length) this.results = rs.map(r => fuzzysort.highlight(r))
        else this.results.push("No results found")
        this.plugin.view.redraw()
    }

    async refreshIndex() {
        let notes = await this.getNotes()
        return notes.map(n => {
            let fieldsText: string = ""
            for (let field in n.fields) {
                fieldsText += `${stripHTML(n.fields[field].value)} | `
            }
            return { preparedFields: fuzzysort.prepare(fieldsText), note: n }
        })
    }

    async getNotes(): Promise<IncomingAnkiConnectNote[]> {
        let ids: number[] = await invoke("findNotes", {query: "deck:*"})
        let notes: IncomingAnkiConnectNote[] = await invoke("notesInfo", {notes: ids})
        return notes
    }

}