import Ember from "ember";

const { get, computed } = Ember;

export default Ember.Controller.extend({
  queryParams: ['prompt', 'disabled', 'blockStyle'],
  prompt: null,
  disabled: null,
  blockStyle: false,
  isDisabled: computed('disabled', {
    get() {
      return get(this, 'disabled') === 'true';
    }
  }),

  alphabet: computed({
    get() {
      return 'abcdefghijklmnopqrstuvwxyz'.split('');
    }
  })
});
