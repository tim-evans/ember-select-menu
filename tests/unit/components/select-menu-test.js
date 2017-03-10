import Ember from "ember";
import {
  moduleForComponent,
  test
} from 'ember-qunit';

var get = Ember.get;
var set = Ember.set;
var RSVP = Ember.RSVP;
var next = Ember.run.next;
var later = Ember.run.later;
var run = Ember.run;

var mock = function () {
  return {
    activate: function () {
      this.isActive = true;
    },
    deactivate: function () {
      this.isActive = false;
    }
  };
};

var type = function (component, text) {
  text.split('').forEach(function (chr) {
    keyDown(component, chr.charCodeAt(0));
  });
};

var defaultPrevented = false;
var keyDown = function (component, keyCode) {
  defaultPrevented = false;
  component.keyDown({ which: keyCode, preventDefault: function () { defaultPrevented = true; } });
};

moduleForComponent('select-menu', 'SelectMenuComponent', {});

test('it unwraps promises', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  var deferred = RSVP.defer();
  run(function () {
    set(component, 'options', [{
      value: "Chocolate Chip Walnut"
    }, {
      value: "Oatmeal Raisin Cookie"
    }, {
      value: "Dark Chocolate Chocolate Chip"
    }, {
      value: "Dark Chocolate Peanut Butter Chip"
    }]);

    set(component, 'value', deferred.promise);
  });

  assert.equal(get(component, 'value'), deferred.promise);
  deferred.resolve("Dark Chocolate Chocolate Chip");

  return deferred.promise.then(function () {
    assert.equal(get(component, 'value'), "Dark Chocolate Chocolate Chip");
  });
});

test('it selects the first option if the promise resolves to null', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  var deferred = RSVP.defer();
  run(function () {
    set(component, 'options', [{
      value: "Chocolate Chip Walnut"
    }, {
      value: "Oatmeal Raisin Cookie"
    }, {
      value: "Dark Chocolate Chocolate Chip"
    }, {
      value: "Dark Chocolate Peanut Butter Chip"
    }]);

    set(component, 'value', deferred.promise);
  });
  assert.equal(get(component, 'value'), deferred.promise);
  deferred.resolve(null);

  stop();
  return deferred.promise.then(function () {
    var d = RSVP.defer();
    next(d, 'resolve');
    return d.promise;
  }).then(function () {
    assert.equal(get(component, 'value'), "Chocolate Chip Walnut");
  });
});

test('it selects nothing if the promise resolves to null and there is a prompt', function (assert) {

  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  var deferred = RSVP.defer();
  run(function () {
    set(component, 'options', [{
      value: "Chocolate Chip Walnut"
    }, {
      value: "Oatmeal Raisin Cookie"
    }, {
      value: "Dark Chocolate Chocolate Chip"
    }, {
      value: "Dark Chocolate Peanut Butter Chip"
    }]);

    set(component, 'value', deferred.promise);
  });

  assert.equal(get(component, 'value'), deferred.promise);
  deferred.resolve(null);

  return deferred.promise.then(function () {
    var d = RSVP.defer();
    set(component, 'prompt', "'ELLO");
    next(d, 'resolve');
    return d.promise;
  }).then(function () {
    assert.equal(get(component, 'value'), null);
  });
});


test('it allows selection through typing', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  run(function () {
    set(component, 'searchBy', ['value']);
    set(component, 'options', [{
      value: "Chocolate Chip Walnut",
      disabled: false
    }, {
      value: "Oatmeal Raisin Cookie",
      disabled: false
    }, {
      value: "Dark Chocolate Chocolate Chip",
      disabled: false
    }, {
      value: "Dark Chocolate Peanut Butter Chip",
      disabled: false
    }]);
  });
  type(component, 'Oat');

  assert.equal(get(component, 'value'), "Oatmeal Raisin Cookie");
});

test('it continues from the current match when searching', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  run(function () {
    set(component, 'searchBy', ['value']);
    set(component, 'options', [{
      value: "Chocolate Chip Walnut",
      disabled: false
    }, {
      value: "Oatmeal Raisin Cookie",
      disabled: false
    }, {
      value: "Dark Chocolate Chocolate Chip",
      disabled: false
    }, {
      value: "Dark Chocolate Peanut Butter Chip",
      disabled: false
    }]);
  });

  type(component, 'Dark Chocolate ');
  assert.equal(get(component, 'value'), "Dark Chocolate Chocolate Chip");
  type(component, 'P');
  assert.equal(get(component, 'value'), "Dark Chocolate Peanut Butter Chip");
});


test('it searches case insensitively', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  run(function () {
    set(component, 'searchBy', ['value']);
    set(component, 'options', [{
      value: "Chocolate Chip Walnut",
      disabled: false
    }, {
      value: "Oatmeal Raisin Cookie",
      disabled: false
    }, {
      value: "Dark Chocolate Chocolate Chip",
      disabled: false
    }, {
      value: "Dark Chocolate Peanut Butter Chip",
      disabled: false
    }]);
  });

  type(component, 'dARK ChOCOLATE ch');
  assert.ok(defaultPrevented);
  assert.equal(get(component, 'value'), "Dark Chocolate Chocolate Chip");
});

test('it handles backspaces', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  run(function () {
    set(component, 'searchBy', ['value']);
    set(component, 'options', [{
      value: "Chocolate Chip Walnut",
      disabled: false
    }, {
      value: "Oatmeal Raisin Cookie",
      disabled: false
    }, {
      value: "Dark Chocolate Chocolate Chip",
      disabled: false
    }, {
      value: "Dark Chocolate Peanut Butter Chip",
      disabled: false
    }]);
  });

  type(component, 'dark chocolate ch');
  assert.keyDown(component, 8);
  assert.keyDown(component, 8);
  assert.equal(get(component, 'value'), "Dark Chocolate Chocolate Chip");
  type(component, 'p');
  assert.equal(get(component, 'value'), "Dark Chocolate Peanut Butter Chip");
});

test('it resets the search string after 750ms', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  run(function () {
    set(component, 'searchBy', ['value']);
    set(component, 'options', [{
      value: "Chocolate Chip Walnut",
      disabled: false
    }, {
      value: "Oatmeal Raisin Cookie",
      disabled: false
    }, {
      value: "Dark Chocolate Chocolate Chip",
      disabled: false
    }, {
      value: "Dark Chocolate Peanut Butter Chip",
      disabled: false
    }]);
  });

  type(component, 'dark');
  assert.equal(get(component, 'value'), "Dark Chocolate Chocolate Chip");

  later(function() {
    type(component, 'choc');
    assert.equal(get(component, 'value'), "Chocolate Chip Walnut");
  }, 800);
});

test('it toggles whether the menu is active using spacebar', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  type(component, ' ');
  assert.ok(get(component, 'isActive'));

  type(component, ' ');
  assert.notOk(get(component, 'isActive'));
});

test('it allows tabs to pass through', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  type(component, ' ');
  assert.ok(get(component, 'isActive'));
  keyDown(component, 9);

  assert.notOk(get(component, 'isActive'));
  assert.ok(!defaultPrevented);
});

test('it allows selection using up and down arrows', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  run(function () {
    set(component, 'options', [{
      value: "A",
      disabled: false
    }, {
      value: "B",
      disabled: false
    }, {
      value: "C",
      disabled: false
    }, {
      value: "D",
      disabled: false
    }]);
  });

  var UP = 38;
  var DOWN = 40;

  return new RSVP.Promise(function (resolve) {
    return later(resolve);
  }).then(function () {
    keyDown(component, DOWN);
    assert.equal(get(component, 'value'), "A");
    assert.ok(get(component, 'isActive'));

    keyDown(component, UP);
    assert.ok(get(component, 'value'), "A");

    keyDown(component, DOWN);
    assert.ok(get(component, 'value'), "B");

    keyDown(component, DOWN);
    assert.ok(get(component, 'value'), "C");

    keyDown(component, DOWN);
    assert.ok(get(component, 'value'), "D");

    keyDown(component, DOWN);
    assert.ok(get(component, 'value'), "D");

    keyDown(component, UP);
    keyDown(component, UP);
    keyDown(component, UP);
    keyDown(component, UP);
    keyDown(component, UP);
    keyDown(component, UP);
    assert.ok(get(component, 'value'), "A");
  });
});

test('it has an API for searching custom fields', function (assert) {
  // creates the component instance
  var component = this.subject({
    popup: mock()
  });

  run(function () {
    set(component, 'options', [{
      value: "A",
      search: "Q",
      disabled: false
    }, {
      value: "B",
      search: "X",
      disabled: false
    }, {
      value: "C",
      search: "Y",
      disabled: false
    }, {
      value: "D",
      search: "Z",
      disabled: false
    }]);
    set(component, 'searchBy', "search");
  });

  assert.deepEqual(get(component, 'searchBy'), ['search']);

  type(component, 'Z');
  assert.equal(get(component, 'value'), "D");
  component.resetSearch();

  type(component, 'X');
  assert.equal(get(component, 'value'), "B");
});
