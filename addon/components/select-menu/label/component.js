import Ember from "ember";
import $ from 'jquery';
import stringify from '../../../computed/stringify';
import layout from './template';

const { get, set, observer, init, computed, computed: { reads, not }, run: { bind, scheduleOnce } } = Ember;

export default Ember.Component.extend({

  tagName: 'a',

  layout,

  classNames: ['select-menu_label'],

  attributeBindings: ['aria-haspopup',
                      'aria-disabled',
                      'aria-expanded',
                      'aria-owns',
                      'tabindex'],

  classNameBindings: ['isPrompting:is-prompting',
                      'menu.isActive:active',
                      'isHovering:hover',
                      'menu.disabled:disabled'],

  prompt: reads('menu.prompt'),

  ariaRole: 'button',
  "aria-haspopup": 'true',
  "aria-owns": reads('menu.list.elementId'),
  "aria-disabled": stringify('menu.disabled'),
  "aria-expanded": stringify("menu.isActive"),

  tabindex: 0,

  init() {
    this._super(...arguments);
    get(this, 'oninit')(this);
  },

  /** @private
    Attach events to labels that having a matching for attribute to this
    select menu.
   */
  didInsertElement() {
    let selector = `label[for="${get(this, 'elementId')}"]`;
    let eventManager = this._eventManager = {
      mouseenter: bind(this, 'set', 'isHovering', true),
      mouseleave: bind(this, 'set', 'isHovering', false)
    };

    Object.keys(eventManager).forEach(function (event) {
      $(document).on(event, selector, eventManager[event]);
    });
  },

  /** @private
    Cleanup event delegation.
   */
  willDestroyElement() {
    let selector = `label[for="${get(this, 'elementId')}"]`;
    let eventManager = this._eventManager;

    Object.keys(eventManager).forEach(function (event) {
      $(document).off(event, selector, eventManager[event]);
    });
  },

  blur() {
    set(this, 'isHovering', false);
  },

  activeDescendant: reads('menu.activeDescendant'),
  isPrompting: not('activeDescendant'),

  activeDescendantDidChange: observer('activeDescendant', on('init', function () {
    scheduleOnce('afterRender', this, 'sync');
  })),

  sync () {
    let activeDescendant = get(this, 'activeDescendant');
    set(this, 'value', activeDescendant ? activeDescendant.$().html() : null);
  }

});
