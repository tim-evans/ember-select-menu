import Ember from "ember";

export default Ember.Route.extend({
  model() {
    return {
      role: 'owner',
      roles: [
        'collaborator',
        'maintainer',
        'owner'
      ]
    };
  }
});
