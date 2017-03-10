import Ember from 'ember';

const { get, computed } = Ember;

export default function (key) {
  return computed(key, {
    get() {
      return get(this, key) && get(this, key).toString();
    }
  });
}
