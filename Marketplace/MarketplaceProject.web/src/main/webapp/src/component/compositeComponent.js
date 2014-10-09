/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define(['component/productComponent', 'component/cartMasterComponent'], function(cartCp, cartMasterCp) {
    App.Component.CompositeComponent = App.Component.BasicComponent.extend({
        initialize: function() {
            this.componentId = App.Utils.randomInteger();
            this.name = "MarketPlace";

            this.setupProductComponent();
            this.setupCartMasterComponent();
        },
        render: function(domElementId) {
			if (domElementId) {
				var rootElement = $("#"+domElementId)
				rootElement.append("<div id='main1' class='col-md-8'></div>");
				rootElement.append("<div id='cart' class='col-md-4'></div>");
				$("#cart").append("<div id='master'></div>");
				$("#cart").append("<div id='items'></div>");
				this.productComponent.render("main1");
				this.cartMasterComponent.renderMaster('master');
				this.cartMasterComponent.masterComponent.create();
				this.cartMasterComponent.renderChild('item','items');
			}
            this.productComponent.renderRecords();
            this.cartMasterComponent.renderChild('item');
        },
        setupProductComponent: function() {
            this.productComponent = new cartCp();
            this.productComponent.initialize();
            this.productComponent.enableMultipleSelection(true);
            this.productComponent.setReadOnly(true);
            this.productComponent.addRecordAction({
                name: 'addToCart',
                icon: '',
                displayName: 'Add to cart',
                show: true
            },
            this.addItem,
            this);
            
            this.productComponent.addGlobalAction({
                name: 'buy',
                icon: 'glyphicon-shopping-cart',
                displayName: 'Add to cart',
                show: true,
                menu: 'utils'
            },
            this.addToCart,
            this);
        },
        setupCartMasterComponent: function() {
            this.cartMasterComponent = new cartMasterCp();
            this.cartMasterComponent.initialize();
            this.cartMasterComponent.masterComponent.clearGlobalActions();
            this.cartMasterComponent.masterComponent.addGlobalAction({
                name: 'checkout',
                icon: 'glyphicon-shopping-cart',
                displayName: 'Checkout',
                show: true
            },
            this.buy,
            this);
            Backbone.off(this.cartMasterComponent.masterComponent.componentId + '-' + 'post-cart-save');
            Backbone.on(this.cartMasterComponent.masterComponent.componentId + '-' + 'post-cart-save', function(){
                var messagesController = new App.Controller.MessageController({el: '#' + this.messageDomId});
                messagesController.showMessage('info', 'Items saved in server', true, 3);
            },this.cartMasterComponent.masterComponent);
            
            this.cartMasterComponent.itemComponent.setGlobalActionsVisible(false);
            this.cartMasterComponent.itemComponent.disableEdit();
			this.cartMasterComponent.hideChilds();
        },
        addToCart: function() {
            var items = this.productComponent.getSelectedRecords();
            var idList = [];
            for (var property in items) {
                if (items.hasOwnProperty(property)) {
                    idList.push({productId: items[property].id});
                }
            }
            this.cartMasterComponent.addItems(idList);
            this.productComponent.clearSelectedRecords();
            this.render();
            
        },
        buy: function(){
            this.cartMasterComponent.masterComponent.save();
        },
        addItem: function(params){
            this.cartMasterComponent.addItems([{productId: params.id}]);
            this.productComponent.clearSelectedRecords();
            this.render();
        }
    });
    return App.Component.CompositeComponent;
});