import { computed, get } from '@ember/object';

export default function (key) {
  return computed(key, {
    get() {
      if (get(this, key)) {
        return 'true';
      } else {
        return 'false';
      }
    }
  });
}
