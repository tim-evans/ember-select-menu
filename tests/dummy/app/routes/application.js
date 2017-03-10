import Ember from "ember";

export default Ember.Route.extend({

  model(params) {
    return Ember.$.get('https://restcountries.eu/rest/v2/all');
  }

});
