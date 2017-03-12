/* global node: true */
module.exports = {
  name: 'ember-single-select',

  included: function (app) {
    this._super.included(app);
    app.import("vendor/styles/ember-single-select.css");
  }
};
