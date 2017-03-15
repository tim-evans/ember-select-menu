/*jshint node:true*/
/* global require, module */
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
    babel: {
      includePolyfill: true
    },
    fingerprint: {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map', 'eot', 'ttf', 'woff', 'woff2', 'svg'],
      prepend: '/ember-single-select/'
    },
    sassOptions: {
      includePaths: ['tests/dummy/app']
    },
    svg: {
      paths: [
        'tests/dummy/public/assets/images'
      ]
    }
  });

  return app.toTree();
};
