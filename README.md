# ember-cli {{select-menu}} [![Build Status](https://travis-ci.org/tim-evans/ember-select-menu.svg?branch=master)](https://travis-ci.org/tim-evans/ember-select-menu)

A simplified interface for custom select widgets. The handlebars is straightforward and easy to read:

```handlebars
<label for="country">Where are you from?</label>
{{#select-menu id="country" prompt="Select a country" value=country search-by="label code"}}
  {{#each it in countries}}
    {{select-option value=it label=it.name code=it.code}}
  {{/each}}
{{/select-menu}}
```

This addon comes with baked in WAI-ARIA support for screen readers, keyboard navigation and keyboard search.


## Installation

* `git clone`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
