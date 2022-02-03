# Obsidian Power Search

Obsidian search is a plugin that allows you to search your notes while you are typing in obsidian (currently limited to only searching anki notes). This has a few benefits:
- helps you to better link your ideas
- helps prevent redundancy as you can see where you have written something else before

## Setup for built in indexes

### Anki

1. Install from the community plugins list
2. Install ankiconnect in anki if you haven't already
3. Go to Tools -> Addons -> AnkiConnect -> Config and add the line ```app://obsidian.md``` to ```webCorsOriginList```, so it is something like this, if you haven't touched the config before

```JSON
{
    "apiKey": null,
    "apiLogPath": null,
    "webBindAddress": "127.0.0.1",
    "webBindPort": 8765,
    "webCorsOrigin": "http://localhost",
    "webCorsOriginList": [
        "http://localhost",
        "app://obsidian.md"
    ]
}
```

4. Restart Anki to apply the changes
5. Run the plugin with anki running in the background
6. See your search results appear in the search pane! (can be reopened with an obsidian command)

### 

## Setup for external indexes

TODO

## Use 

Obsidian power search is an automatic plugin - you don't have to activate the search in any way, just configure and go! While you are typing, it will search your anki notes (more searchable content types added to the index in the future, including custom types) for the line or block of text you are writing (surrounded by whitespace) and provide the best results. There is an obsidian command to reopen the search result pane if it is ever closed.

## Config

TODO 

## Integration with other plugins

TODO

## API 

TODO

## TODO 

- add search query history to undo search history
- pin searches
- paginate results and allow page limit configuration
- deal with cannot connect to anki errors
- search blocks vs line option 
- sources other than anki (allow registering "sources" through api)
- allow index and search customisation
- highlight words that are part of the search
- have stripped and highlighted section as toggle and then the original html as the expand content under the toggle
- allow typos?
- Allow selection of search results themselves to search for more notes (see other siac functionality)
- fix image error console and in cards
- make general index creator accessible by api to allow others to add their own searchable content to the index
- anki css for notes (override plugin css? + make this an option?)
- use svelte components?
- integration with obsidian to anki? i.e. find the note using the id (not necessary due to obsidian link?)
- refresh index command? + option to not debounced refresh index on each search 
- render maths eqns
