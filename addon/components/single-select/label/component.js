import Ember from "ember";
import $ from 'jquery';
import stringify from '../../../computed/stringify';
import layout from './template';

const { get, set, computed: { not }, run: { bind } } = Ember;

export default Ember.Component.extend({

  tagName: 'a',

  layout,

  classNames: ['single-select_label'],

  attributeBindings: ['aria-haspopup',
                      'aria-disabled',
                      'aria-expanded',
                      'aria-owns',
                      'tabindex'],

  classNameBindings: ['isPrompting:is-prompting',
                      'expanded:expanded',
                      'isHovering:hover',
                      'disabled:disabled'],

  ariaRole: 'button',
  "aria-haspopup": 'true',
  "aria-disabled": stringify('disabled'),
  "aria-expanded": stringify('expanded'),

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
    let selector = `label[for="${get(this, 'for')}"]`;
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

  isPrompting: not('activeDescendant')

});
