import Ember from "ember";

export default Ember.Route.extend({

  model(params) {
    return [{
      id: "choc-chip",
      disabled: params.disabled === "choc-chip",
      name: "Chocolate Chip"
    }, {
      id: "digestive",
      disabled: params.disabled === "digestive",
      name: "Digestive"
    }, {
      id: "oatmeal",
      disabled: params.disabled === "oatmeal",
      name: "Oatmeal Raisin"
    }, {
      id: "pb-chip",
      disabled: params.disabled === "pb-chip",
      name: "Dark Chocolate Peanut Butter Chip"
    }, {
      id: "dark-choc-chip",
      disabled: params.disabled === "dark-choc-chip",
      name: "Dark Chocolate Chocolate Chip"
    }, {
      id: "pb",
      disabled: params.disabled === "pb",
      name: "Peanut Butter"
    }];
  }

});
