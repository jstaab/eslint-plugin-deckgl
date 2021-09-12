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

Enable the rules that you would like to use.

```json
  "rules": {
    "deckgl/exhaustive-triggers": "warning"
  }
```

# License

ESLint-plugin-DeckGL is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
