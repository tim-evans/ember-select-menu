import Ember from "ember";
import startApp from "../helpers/start-app";

var App;

['?blockStyle', ''].forEach(function (qp) {

module("Acceptance: <label>" + qp, {
  setup: function () {
    App = startApp();
  },
  teardown: function () {
    Ember.run(App, "destroy");
  }
});

test("clicking on the label will open the menu", async function (assert) {
  await visit("/" + qp);
  await click("label[for='favorite-cookie']");

  var label = find("#favorite-cookie");
  assert.equal(label.attr('aria-expanded'), "true");
});

test("hovering over the label will trigger a hover class on the select-menu label", async function (assert) {
  await visit("/" + qp);
  await triggerEvent("label[for='favorite-cookie']", "mouseenter");

  var label = find("#favorite-cookie");
  assert.ok(label.hasClass('hover'));

  await triggerEvent("label[for='favorite-cookie']", "mouseleave");

  var label = find("#favorite-cookie");
  assert.notOk(label.hasClass('hover'));
});

});
