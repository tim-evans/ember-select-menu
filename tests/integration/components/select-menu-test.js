import Ember from 'ember';
import RSVP from 'rsvp';
import { getLayout } from "dom-ruler";
import hbs from 'htmlbars-inline-precompile';
import { keyEvent, click, triggerEvent } from 'ember-native-dom-helpers/test-support/helpers';
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
      let characters = text.split('');

      for (let i = 0, len = characters.length; i < len; i++) {
        await this.keyDown(text.charCodeAt(i));
      }
    };

    this.keyDown = async function (keyCode) {
      if (!waited) {
        await wait();
        waited = true;
      }
      await keyEvent(this.$('.single-select')[0], 'keydown', keyCode);
    };

    let render = this.render;
    this.render = function (template) {
      return render.apply(this, [template || hbs`
      <label for="cookie">Cookie</label>
      {{~#single-select id='cookie' options=options value=value onchange=(action (mut value)) search-by=searchBy gravity='s' disabled=disabled disabledOptions=disabledOptions as |option|~}}
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
  assert.equal(this.$('.single-select a').text(), 'Select a cookie');
  assert.ok(this.$('.single-select a').hasClass('is-prompting'));

  this.set('value', this.get('options.firstObject'));

  assert.notOk(this.$('.single-select a').hasClass('is-prompting'));
  assert.equal(this.$('.single-select a').text(), 'Chocolate Chip Walnut');
});

test('it unwraps promises', async function (assert) {
  this.render();

  let { promise, resolve } = RSVP.defer();
  this.set('value', promise);

  resolve(this.get('options')[2]);

  await promise;
  assert.equal(this.$('.single-select').text(), "Dark Chocolate Chocolate Chip");
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
    {{~/single-select}}
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
  assert.ok(this.$('.single-select a').hasClass('expanded'));

  await this.type(' ');
  assert.notOk(this.$('.single-select a').hasClass('expanded'));
});

test('it allows tabs to pass through', async function (assert) {
  this.render();

  await this.type(' ');
  assert.ok(this.$('.single-select a').hasClass('expanded'));
  await this.keyDown(9);

  assert.notOk(this.$('.single-select a').hasClass('expanded'));
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
  assert.equal(this.get('value'), null);
  assert.ok(this.$('a').hasClass('expanded'));

  await this.keyDown(DOWN);
  assert.deepEqual(this.get('value'), { value: "A" });

  await this.keyDown(UP);
  assert.deepEqual(this.get('value'), { value: "A" });

  await this.keyDown(DOWN);
  assert.deepEqual(this.get('value'), { value: "B" });

  await this.keyDown(DOWN);
  assert.deepEqual(this.get('value'), { value: "C" });

  await this.keyDown(DOWN);
  assert.deepEqual(this.get('value'), { value: "D" });

  await this.keyDown(DOWN);
  assert.deepEqual(this.get('value'), { value: "D" });

  await this.keyDown(UP);
  await this.keyDown(UP);
  await this.keyDown(UP);
  await this.keyDown(UP);
  await this.keyDown(UP);
  await this.keyDown(UP);
  assert.deepEqual(this.get('value'), { value: "A" });
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

test("clicking on the label will open the menu", async function (assert) {
  this.render();
  await click("label[for='cookie']");

  assert.equal(this.$('a').attr('aria-expanded'), "true");
});

test("hovering over the label will trigger a hover class on the simple-select label", async function (assert) {
  this.render();
  await triggerEvent("label", "mouseenter");

  assert.ok(this.$('a').hasClass('hover'));

  await triggerEvent("label", "mouseleave");

  assert.notOk(this.$('a').hasClass('hover'));
});

test("searching for an option will focus it into view", async function (assert) {
  this.set('options', 'abcdefghijklmnopqrstuvwxyz'.split('').map((chr) => { value: chr }));

  this.render();
  await this.type('z');

  let popover = this.$('.pop-over-container');
  let list = this.$('ul');
  let maxScrollTop = getLayout(list[0]).padding.height - getLayout(popover[0]).height;
  assert.equal(list.scrollTop(), maxScrollTop);

  await this.type('a');

  assert.equal(popover.scrollTop(), 0);
});

test("using up and down arrows will focus the element into view", async function (assert) {
  this.set('options', 'abcdefghijklmnopqrstuvwxyz'.split('').map((chr) => { value: chr }));

  this.render();

  const UP = 38;
  const DOWN = 40;

  for (var i = 0; i < 7; i++) {
    await this.keyDown(DOWN);
    assert.equal(this.$('ul').scrollTop(), 0);
  }

  await this.keyDown(DOWN);
  assert.ok(this.$('ul').scrollTop() > 0);

  for (i = 0; i < 6; i++) {
    await this.keyDown(UP);
    assert.ok(this.$('ul').scrollTop() > 0);
  }

  await this.keyDown(UP);
  assert.equal(this.$('ul').scrollTop(), 0);
});

test("WAI-ARIA / label attributes", async function (assert) {
  this.render();

  let label = this.$('#cookie a');
  assert.equal(label.attr('role'), 'button');
  assert.equal(label.attr('aria-haspopup'), 'true');
  assert.equal(label.attr('aria-disabled'), 'false');
  assert.equal(label.attr('aria-expanded'), 'false');

  await click('#cookie a');

  assert.equal(label.attr('aria-expanded'), 'true');
  assert.equal(label.attr('aria-owns'), this.$('ul').attr('id'));

  this.set('disabled', true);
  assert.equal(label.attr('aria-disabled'), 'true');
});

test("WAI-ARIA / list", async function (assert) {
  this.render();

  await click('#cookie a');

  let list = this.$("ul");
  assert.equal(list.attr('role'), "listbox");
  assert.equal(list.attr('aria-hidden'), "false");
  assert.equal(list.attr('aria-disabled'), "false");
  assert.equal(list.attr('aria-labelledby'), "single-select_label_cookie");
  assert.equal(list.attr('aria-activedescendant'), null);

  this.set('disabled', true);
  assert.equal(list.attr('aria-disabled'), "true");

  this.set('value', this.get('options')[0]);
  assert.equal(list.attr('aria-activedescendant'), "single-select_option_cookie_0");
});

test("WAI-ARIA / option", async function (assert) {
  this.render();

  await click("#cookie a");

  let chocolateChip = this.$("li:first-child");
  assert.equal(chocolateChip.attr('role'), "option");
  assert.equal(chocolateChip.attr('aria-selected'), "false");
  assert.equal(chocolateChip.attr('aria-disabled'), "false");
  assert.equal(chocolateChip.attr('aria-label'), "Chocolate Chip Walnut");

  let peanutButter = this.$("li:last-child");
  assert.equal(peanutButter.attr('role'), "option");
  assert.equal(peanutButter.attr('aria-selected'), "false");
  assert.equal(peanutButter.attr('aria-disabled'), "false");
  assert.equal(peanutButter.attr('aria-label'), "Dark Chocolate Peanut Butter Chip");

  await click(peanutButter[0]);

  assert.equal(chocolateChip.attr('aria-selected'), "false");
  assert.equal(peanutButter.attr('aria-selected'), "true");

  await click(chocolateChip[0]);

  assert.equal(chocolateChip.attr('aria-selected'), "true");
  assert.equal(peanutButter.attr('aria-selected'), "false");

  // This triggers a re-render, so we need to inspect the options again
  this.set('disabledOptions', [this.get('options')[0]]);

  chocolateChip = this.$("li:first-child");
  peanutButter = this.$("li:last-child");
  assert.equal(chocolateChip.attr('aria-disabled'), "true");
  assert.equal(peanutButter.attr('aria-disabled'), "false");
});
