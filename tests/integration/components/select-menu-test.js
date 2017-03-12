import Ember from 'ember';
import RSVP from 'rsvp';
import hbs from 'htmlbars-inline-precompile';
import { keyEvent } from 'ember-native-dom-helpers/test-support/helpers';
import {
  moduleForComponent,
  test,
  skip
} from 'ember-qunit';

var wait = function (ms) {
  return new RSVP.Promise((resolve) => {
    Ember.run.later(resolve, ms);
  });
}

moduleForComponent('single-select', {
  integration: true,
  beforeEach() {
    this.set('options', Ember.A([{
      value: "Chocolate Chip Walnut"
    }, {
      value: "Oatmeal Raisin Cookie"
    }, {
      value: "Dark Chocolate Chocolate Chip"
    }, {
      value: "Dark Chocolate Peanut Butter Chip"
    }]));

    let waited = false;

    this.type = async function (text) {
      if (!waited) {
        await wait();
      }
      let characters = text.split('');

      for (let i = 0, len = characters.length; i < len; i++) {
        await this.keyDown(text.charCodeAt(i));
      }
    };

    this.keyDown = function (keyCode) {
      return keyEvent(this.$('.single-select')[0], 'keydown', keyCode);
    };

    let render = this.render;
    this.render = function (template) {
      return render.apply(this, [template || hbs`
      {{~#single-select options=options value=value onchange=(action (mut value)) search-by=searchBy gravity='s' as |option|~}}
        {{option.value}}
      {{~else~}}
        Select a cookie
      {{~/single-select~}}
      `]);
    }
  }
});

test('prompt', async function (assert) {
  this.render();
  assert.equal(this.$().text(), 'Select a cookie');
  assert.ok(this.$('.single-select_label').hasClass('is-prompting'));

  this.set('value', this.get('options.firstObject'));

  assert.notOk(this.$('.single-select_label').hasClass('is-prompting'));
  assert.equal(this.$().text(), 'Chocolate Chip Walnut');
});

test('it unwraps promises', async function (assert) {
  this.render();

  let { promise, resolve } = RSVP.defer();
  this.set('value', promise);

  resolve(this.get('options')[2]);

  await promise;
  assert.equal(this.$().text(), "Dark Chocolate Chocolate Chip");
});

test('it selects the first option if the promise resolves to null', async function (assert) {
  this.on('update', function (value) {
    assert.deepEqual(value, {
      value: "Chocolate Chip Walnut"
    });
  });

  this.render(hbs`
    {{#single-select options=options value=value onchange=(action 'update') as |option|~}}
      {{option.value}}
    {{/single-select}}
  `);

  let { promise, resolve } = RSVP.defer();
  this.set('value', promise);

  resolve(null);
  await promise;
});

test('it selects nothing if the promise resolves to null and there is a prompt', async function (assert) {
  this.render();

  let { promise, resolve } = RSVP.defer();
  this.set('value', promise);

  resolve(null);

  await promise;
  await wait();
  assert.equal(this.get('value'), promise);
});

test('it allows selection through typing', async function (assert) {
  this.render();
  await this.type('Oat');

  assert.deepEqual(this.get('value'), {
    value: "Oatmeal Raisin Cookie"
  });
});

test('it continues from the current match when searching', async function (assert) {
  this.render();

  await this.type('Dark Chocolate ');
  assert.deepEqual(this.get('value'), {
    value: "Dark Chocolate Chocolate Chip"
  });

  await this.type('P');
  assert.deepEqual(this.get('value'), {
    value: "Dark Chocolate Peanut Butter Chip"
  });
});


test('it searches case insensitively', async function (assert) {
  this.render();

  await this.type('dARK ChOCOLATE ch');
  assert.deepEqual(this.get('value'), {
    value: "Dark Chocolate Chocolate Chip"
  });
});

test('it handles backspaces', async function (assert) {
  this.render();

  await this.type('dark chocolate ch');
  await this.keyDown(8);
  await this.keyDown(8);

  assert.deepEqual(this.get('value'), {
    value: "Dark Chocolate Chocolate Chip"
  });

  await this.type('p');
  assert.deepEqual(this.get('value'), {
    value: "Dark Chocolate Peanut Butter Chip"
  });
});

test('it resets the search string after 750ms', async function (assert) {
  this.render();

  await this.type('dark');
  assert.deepEqual(this.get('value'), {
    value: "Dark Chocolate Chocolate Chip"
  });

  await wait(800);
  await this.type('choc');
  assert.deepEqual(this.get('value'), {
    value: "Chocolate Chip Walnut"
  });
});

test('it toggles whether the menu is active using spacebar', async function (assert) {
  this.render();

  await this.type(' ');
  assert.ok(this.$('.single-select').hasClass('expanded'));

  await this.type(' ');
  assert.notOk(this.$('.single-select').hasClass('expanded'));
});

test('it allows tabs to pass through', async function (assert) {
  this.render();

  await this.type(' ');
  assert.ok(this.$('.single-select').hasClass('expanded'));
  await this.keyDown(9);

  assert.notOk(this.$('.single-select').hasClass('expanded'));
});

test('it allows selection using up and down arrows', async function (assert) {
  this.render();

  this.set('options', [{
    value: "A",
  }, {
    value: "B",
  }, {
    value: "C",
  }, {
    value: "D",
  }]);

  const UP = 38;
  const DOWN = 40;

  await this.keyDown(DOWN);
  assert.equal(this.get('value'), "A");
  assert.ok(this.$('.single-select').hasClass('expanded'));

  await this.keyDown(UP);
  assert.ok(this.get('value'), "A");

  await this.keyDown(DOWN);
  assert.ok(this.get('value'), "B");

  await this.keyDown(DOWN);
  assert.ok(this.get('value'), "C");

  await this.keyDown(DOWN);
  assert.ok(this.get('value'), "D");

  await this.keyDown(DOWN);
  assert.ok(this.get('value'), "D");

  await this.keyDown(UP);
  await this.keyDown(UP);
  await this.keyDown(UP);
  await this.keyDown(UP);
  await this.keyDown(UP);
  await this.keyDown(UP);
  assert.ok(this.get('value'), "A");
});

test('it has an API for searching custom fields', async function (assert) {
  this.render();

  this.set('options', [{
    value: "A",
    search: "Q"
  }, {
    value: "B",
    search: "X"
  }, {
    value: "C",
    search: "Y"
  }, {
    value: "D",
    search: "Z"
  }]);
  this.set('searchBy', "search");

  await this.type('Z');
  assert.equal(this.get('value.value'), "D");

  await wait(750);

  await this.type('X');
  assert.equal(this.get('value.value'), "B");
});
