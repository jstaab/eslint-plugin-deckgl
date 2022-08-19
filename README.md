ESLint-plugin-DeckGL
===================

Deck.gl specific linting rules for ESLint

# Installation

Install [ESLint](https://www.github.com/eslint/eslint) either locally or globally. (Note that locally, per project, is strongly preferred)

```sh
$ npm install eslint --save-dev
```

If you installed `ESLint` globally, you have to install Deck.gl plugin globally too. Otherwise, install it locally.

```sh
$ npm install https://github.com/jstaab/eslint-plugin-deckgl --save-dev
```

# Configuration

Add "deckgl" to the plugins section.

```json
{
  "plugins": [
    "deckgl"
  ]
}
```

Enable the rules that you would like to use

```json
  "rules": {
    "deckgl/exhaustive-triggers": "warning"
  }
```

# Rules

## exhaustive-triggers

All non-local variables used in an accessor function must be listed in the containing layer's [updateTriggers](https://deck.gl/docs/developer-guide/performance#use-updatetriggers) property, under the key of the accessor function name.

```javascript
new ScatterplotLayer({
  data: [...],
  getRadius: d => Math.sqrt(d.populationsByYear[currentYear]),
  // ^^^ exhaustive-triggers will complain: "currentYear" missing from updateTriggers
});

new ScatterplotLayer({
  data: [...],
  getRadius: d => Math.sqrt(d.populationsByYear[currentYear]),
  // ^^^ all ok
  updateTriggers: {
    getRadius: [currentYear]
  },
});

 new ScatterplotLayer({
  data: [...],
  getRadius: d => Math.sqrt(d.populationsByYear[0]),
  // ^^^ all ok -- all variables are local
});
```

All [updateTriggers](https://deck.gl/docs/developer-guide/performance#use-updatetriggers) property values must be arrays when their corresponding accessor function contains non-local variables.

```javascript
new ScatterplotLayer({
  data: [...],
  getRadius: d => Math.sqrt(d.populationsByYear[currentYear]),
  // ^^^ exhaustive-triggers will complain (because it expects an array)
  updateTriggers: {
    getRadius: currentYear
    // ^^^ exhaustive-triggers will complain: "getRadius" updateTrigger should be an array
  },
});
```

# License

ESLint-plugin-DeckGL is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
