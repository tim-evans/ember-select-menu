import Ember from 'ember';
import stringify from '../../../computed/stringify';
import ScrollSandbox from 'ember-pop-over/mixins/scroll_sandbox';

const { computed: { reads, not } } = Ember;

export default Ember.Component.extend(ScrollSandbox, {

  tagName: 'ul',

  classNames: ['select-menu_list'],

  isHidden: not('popover.isVisible'),

  // .............................................
  // WAI ARIA attributes
  //

  attributeBindings: ['aria-hidden',
                      'aria-labelledby',
                      'aria-disabled',
                      'aria-activedescendant'],

  ariaRole: 'listbox',
  'aria-hidden': stringify('isHidden'),
  'aria-labelledby': reads('menu.label.elementId'),
  'aria-disabled': stringify('menu.disabled'),
  'aria-activedescendant': reads('menu.activeDescendant.elementId')

});
