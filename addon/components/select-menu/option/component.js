import Ember from 'ember';
import stringify from '../../../computed/stringify';
import layout from './template';

const { get, set, computed, computed: { reads }, isEqual } = Ember;

export default Ember.Component.extend({

  layout,

  tagName: 'li',
  classNames: ['select-option'],
  classNameBindings: ['selected', 'disabled'],
  attributeBindings: ['aria-selected', 'aria-disabled', 'aria-label'],

  ariaRole: 'option',
  'aria-selected': stringify('selected'),
  'aria-disabled': stringify('disabled'),
  'aria-label': reads('label'),

  label: null,
  disabled: false,

  didInsertElement() {
    get(this, 'menu.options').unshiftObject(this);
  },

  willDestroyElement() {
    get(this, 'menu.options').removeObject(this);
  },

  activeDescendant: reads('menu.activeDescendant'),
  selection: reads('menu.value'),

  selected: computed('selection', 'value', {
    get() {
      return isEqual(get(this, 'selection'), get(this, 'value'));
    }
  }),

  click() {
    if (get(this, 'disabled')) { return; }
    get(this, 'onselect')(this);
    return false;
  }

});
