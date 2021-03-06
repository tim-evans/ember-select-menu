import Component from '@ember/component';
import { computed, set, get } from '@ember/object';
import { isEqual } from '@ember/utils';
import stringify from '../../../computed/stringify';
import layout from './template';

export default Component.extend({

  layout,

  tagName: 'li',
  classNames: ['select-option'],
  classNameBindings: ['selected', 'disabled'],
  attributeBindings: ['aria-selected', 'aria-disabled', 'aria-label'],

  ariaRole: 'option',
  'aria-selected': stringify('selected'),
  'aria-disabled': stringify('disabled'),
  'aria-label': null,

  label: null,
  disabled: false,

  selected: computed('selection', 'value', {
    get() {
      return isEqual(get(this, 'selection'), get(this, 'value'));
    }
  }),

  didRender() {
    let label = get(this, 'element').innerHTML.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    if (get(this, 'aria-label') !== label) {
      set(this, 'aria-label', label);
    }
  },

  click() {
    if (get(this, 'disabled')) { return; }
    get(this, 'onselect')(this);
    return false;
  }

});
