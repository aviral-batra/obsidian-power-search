# Obsidian Power Search

Obsidian search is a plugin that allows you to search your notes while you are typing in obsidian (you can currently search your obsidian notes and your anki notes). This has a few benefits:
- helps you to better link your ideas as you can link similar information when you see similar note text
- helps prevent redundancy as you can see where you have written something else before
- easier maintainence of notes as you can update them whenever you see something you want to change

## General setup

1. Install the plugin from community plugins
2. Select your debounce refresh timeouts and activate the indexes you want to search by enabling their toggles
3. Search happens automatically!

## Setup for built in indexes

### Obsidian

Automatic - just activate in settings!

### Anki


1. Install ankiconnect in anki if you haven't already
2. Go to Tools -> Addons -> AnkiConnect -> Config and add the line ```app://obsidian.md``` to ```webCorsOriginList```, so it is something like this, if you haven't touched the config before

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

3. Restart Anki to apply the changes
4. Run the plugin with anki running in the background
5. Activate the anki index in settings 

## Activating indexes

You can toggle the setting for the index within the "Power Search" Settings tab in obsidian. Toggle the index switch to add a certain type of note to the content to be searched (and rendered in the pane).

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

- only update flexsearch index with changed notes/cards + keep the display etc. stored for use if the cards are not changed
- error - use already loaded notes to get ids if notes not loading (when removing index)/ whatever the problem is - id is undefined when anki index not able to load
- index specific settings e.g. obsidian index remove current file from rendered results

- make card shadow darker

- add search query history to undo search history
- cache search results
- make ui blend in with theme
- add a search bar at top of widget
- different columns show different types of notes
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
- fix image error console
- make general index creator accessible by api to allow others to add their own searchable content to the index
- anki css for notes (override plugin css? + make this an option?)
- use svelte components?
- integration with obsidian to anki? i.e. find the note using the id (not necessary due to obsidian link?)
- refresh index command? + option to not debounced refresh index on each search 
- set min search debounce timeout to be equal to an arbitrary large search + rendering time rounded up to the nearest hundred + 100 so that another search is not started while the previous one is being rendered/add a variable which states the search is still going on and don't let a new search start if this variable is true
