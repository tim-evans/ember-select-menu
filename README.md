# ember-cli {{single-select}} [![Build Status](https://travis-ci.org/tim-evans/ember-single-select.svg?branch=master)](https://travis-ci.org/tim-evans/ember-single-select)

A simplified interface for custom select widgets. The handlebars is straightforward and easy to read:

```handlebars
<label for="country">Where are you from?</label>
{{#single-select id="country" value=country onchange=(action (mut country)) search-by="label code" as |country|}}
  {{country.name}}
{{else}}
  Select a country
{{/single-select}}
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
