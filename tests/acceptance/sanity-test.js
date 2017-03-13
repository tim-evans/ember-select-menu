/*import Ember from "ember";
import startApp from "../helpers/start-app";

var App;

['?blockStyle', ''].forEach(function (qp) {

module("Acceptance: sanity" + qp, {
  setup: function () {
    App = startApp();
  },
  teardown: function () {
    Ember.run(App, "destroy");
  }
});

test("no prompt", function () {
  expect(3);
  visit("/" + qp);
  andThen(function () {
    equal(find("#favorite").html(), "Chocolate Chip");
  });

  click("#favorite-cookie");
  click("#digestive");

  andThen(function () {
    equal(find("#favorite").html(), "Digestive");
  });

  click("#favorite-cookie");
  click("#pb");

  andThen(function () {
    equal(find("#favorite").html(), "Peanut Butter");
  });
});

test("with prompt", function () {
  expect(3);
  visit("/?prompt=Pick a cookie" + qp.replace('?', '&'));
  andThen(function () {
    equal(find("#favorite").html(), "");
  });

  click("#favorite-cookie");
  click("#digestive");

  andThen(function () {
    equal(find("#favorite").html(), "Digestive");
  });

  click("#favorite-cookie");
  click("#pb");

  andThen(function () {
    equal(find("#favorite").html(), "Peanut Butter");
  });
});

test("disabled", function () {
  expect(2);
  visit("/?disabled" + qp.replace('?', '&'));
  click("#favorite-cookie");
  andThen(function () {
    var label = find("#favorite-cookie");
    ok(label.hasClass('disabled'));
    equal(label.attr('aria-expanded'), "false");
  });
});

test("not disabled", function () {
  expect(1);
  visit("/" + qp);
  click("#favorite-cookie");
  andThen(function () {
    var label = find("#favorite-cookie");
    ok(!label.hasClass('disabled'));
  });
});

});
*/
