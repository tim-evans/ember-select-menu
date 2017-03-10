/* global node: true */
module.exports = {
  name: 'ember-select-menu',

  included: function (app) {
    this._super.included(app);
    app.import("vendor/styles/ember-select-menu.css");
  }
};
