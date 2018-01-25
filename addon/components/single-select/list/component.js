import Component from '@ember/component';
import { not } from '@ember/object/computed';
import stringify from '../../../computed/stringify';
import ScrollSandbox from 'ember-pop-over/mixins/scroll_sandbox';

export default Component.extend(ScrollSandbox, {

  tagName: 'ul',

  classNames: ['single-select_list'],

  isHidden: not('isExpanded'),

  // .............................................
  // WAI ARIA attributes
  //

  attributeBindings: ['aria-hidden',
                      'aria-labelledby',
                      'aria-disabled',
                      'aria-activedescendant'],

  ariaRole: 'listbox',
  'aria-hidden': stringify('isHidden'),
  'aria-disabled': stringify('disabled'),

});
