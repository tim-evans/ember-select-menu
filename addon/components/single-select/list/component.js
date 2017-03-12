import Ember from 'ember';
import stringify from '../../../computed/stringify';
import ScrollSandbox from 'ember-pop-over/mixins/scroll_sandbox';

const { computed: { not } } = Ember;

export default Ember.Component.extend(ScrollSandbox, {

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
