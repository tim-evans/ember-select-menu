import Ember from "ember";

export default Ember.Route.extend({
  model() {
    return Ember.$.get('https://restcountries.eu/rest/v2/all');
  }
});
