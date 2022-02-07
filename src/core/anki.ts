import { ObsidianProtocolData, renderMath } from "obsidian"
import { SearchIndex } from "src"
import { FuzzySearcher } from "src/search"
import { stripHTML } from "src/utils"

export class AnkiIndex extends SearchIndex {

    constructor(searcher: FuzzySearcher) {
        super(searcher, "Anki Note")
        this.plugin.registerObsidianProtocolHandler("anki", (params: ObsidianProtocolData) => invoke("guiBrowse", {query: `nid:${params.id}`}))
    }

    async getOriginalNotes(): Promise<IncomingAnkiConnectNote[]> {
        let ids: number[] = await invoke("findNotes", {query: "deck:*"})
        let notes: IncomingAnkiConnectNote[] = await invoke("notesInfo", {notes: ids})
        return notes
    }

    getIdFromOriginal(original: IncomingAnkiConnectNote) {
        return original.noteId
    }

    getNameFromOriginal(original: IncomingAnkiConnectNote): string {
        return original.noteId.toString()
    }

    getLinkFromOriginal(original: IncomingAnkiConnectNote): string {
        return "obsidian://anki?" + String.raw`&id=` + encodeURIComponent(original.noteId)
    }

    async getRawSearchDataFromOriginal(original: IncomingAnkiConnectNote): Promise<string> {
        return stripHTML(this.getFieldsText(original))
    }

    async getDisplayFromOriginal(original: IncomingAnkiConnectNote): Promise<Element> {
        let htmlEl = createDiv({ cls: 'power-search-results-card' })
        htmlEl.innerHTML = this.getFieldsText(original)
        this.renderMathForNote(htmlEl)
        await this.fixImagesForNote(htmlEl)
        return htmlEl
    }
    

    async beforeProduction(origNotes: IncomingAnkiConnectNote[]): Promise<void> {
        // bulk load not needed
    }

    getFieldsText(original: IncomingAnkiConnectNote) {
        let fieldsText: string = ""
        for (let field in original.fields) {
            fieldsText += `${original.fields[field].value} |`
        }
        return fieldsText
    }

    renderMathForNote(el: Element) {
        let str = el.innerHTML
        let startDelimIndex = str.indexOf("\\\(")
        let endDelimIndex = str.indexOf("\\\)")
        let startIndex = 0 
        let strList: string[] = []
        while (startDelimIndex != -1 && endDelimIndex != -1) {
            strList.push(str.substring(startIndex, startDelimIndex))
            let substring = str.substring(startDelimIndex + 2, endDelimIndex)
            strList.push(renderMath(substring, true).innerHTML)
            startIndex = endDelimIndex + 2
            startDelimIndex = str.indexOf("\\\(", startIndex)
            endDelimIndex = str.indexOf("\\\)", startIndex)
        }
        strList.push(str.substring(startIndex))
        el.innerHTML = strList.join("")
    }

    async fixImagesForNote(el: Element) {
        let imgs = Array.from(el.getElementsByTagName("img"))
        for (let img of imgs) {
            let imgBase64 = await invoke("retrieveMediaFile", {filename: img.alt})
            img.src = `data:image/png;base64, ${imgBase64}`
        };
    }
}

interface IncomingAnkiConnectNote {
	noteId: number,
	modelName: string,
    tags: string[],
	fields: {[fieldname: string]: {
        value: string,
        order: number
    }}
}

const ANKI_PORT: number = 8765

export function invoke(action: string, params={}): Promise<any> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.addEventListener('error', () => reject('failed to issue request'));
        xhr.addEventListener('load', () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (Object.getOwnPropertyNames(response).length != 2) {
                    throw 'response has an unexpected number of fields';
                }
                if (!response.hasOwnProperty('error')) {
                    throw 'response is missing required error field';
                }
                if (!response.hasOwnProperty('result')) {
                    throw 'response is missing required result field';
                }
                if (response.error) {
                    throw response.error;
                }
                resolve(response.result);
            } catch (e) {
                reject(e);
            }
        });

        xhr.open('POST', 'http://127.0.0.1:' + ANKI_PORT.toString());
        xhr.send(JSON.stringify({action, version: 6, params}));
    });
}
