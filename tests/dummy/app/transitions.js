import Ember from 'ember';

export default function () {
  let duration = Ember.testing ? 0 :150;
  let easing = 'ease-in-out';

  this.transition(
    this.hasClass('liquid-pop-over'),
    this.toValue(true),
    this.use('toolTip', { duration, easing }),
    this.reverse('toolTip', { duration, easing })
  );
}
