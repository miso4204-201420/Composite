define(['component/_cartMasterComponent'], function (_CartMasterComponent) {
	App.Component.CartMasterComponent = _CartMasterComponent.extend({
		postInit: function(){
			//Escribir aquí las instrucciones que desea ejecutar al inicializar el componente
		},
		
		addItems: function (params) {
			var list = this.itemComponent.getRecords();
			for (var idx in params) {
				var productId = params[idx].productId;
				var model = _.findWhere(list,{productId: productId});
				if (model) {
					model.quantity++;
					this.itemComponent.updateRecord(model);
				} else {
					this.itemComponent.addRecords({productId: productId, quantity: 1}); 
				}
			}
		}
	});
	return App.Component.CartMasterComponent;
});