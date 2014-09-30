define([], function() {
    App.Model._CartMasterModel = Backbone.Model.extend({
     	initialize: function() {
            this.on('invalid', function(model,error) {
                Backbone.trigger('cart-master-model-error', error);
            });
        },
        validate: function(attrs, options){
        	var modelMaster = new App.Model.CartModel();
        	if(modelMaster.validate){
            	return modelMaster.validate(attrs.cartEntity,options);
            }
        }
    });

    App.Model._CartMasterList = Backbone.Collection.extend({
        model: App.Model._CartMasterModel,
        initialize: function() {
        }

    });
    return App.Model._CartMasterModel;
    
});