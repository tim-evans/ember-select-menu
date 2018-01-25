import $ from 'jquery';
import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    return $.get('https://restcountries.eu/rest/v2/all');
  }

});
