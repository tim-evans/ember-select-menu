import Component from '@ember/component';
import { set, get } from '@ember/object';
import { not } from '@ember/object/computed';
import { bind } from '@ember/runloop';
import stringify from '../../../computed/stringify';
import layout from './template';

export default Component.extend({

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
    let label = document.querySelector(`label[for="${get(this, 'for')}"]`);
    if (label == null) { return; }

    let eventManager = this._eventManager = {
      click: bind(this, () => {
        get(this, 'open')();
      }),
      mouseenter: bind(this, () => {
        this.set('isHovering', true);
      }),
      mouseleave: bind(this, () => {
        this.set('isHovering', false);
      })
    };

    Object.keys(eventManager).forEach(function (event) {
      label.addEventListener(event, eventManager[event]);
    });
  },

  /** @private
    Cleanup event delegation.
   */
  willDestroyElement() {
    let label = document.querySelector(`label[for="${get(this, 'for')}"]`);
    if (label == null) { return; }

    let eventManager = this._eventManager;

    Object.keys(eventManager).forEach(function (event) {
      label.removeEventListener(event, eventManager[event]);
    });
  },

  blur() {
    set(this, 'isHovering', false);
  },

  isPrompting: not('activeDescendant')

});
