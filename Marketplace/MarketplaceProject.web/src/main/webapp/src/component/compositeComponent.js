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

            var rootElement = $("#maindiv")
            rootElement.append("<div id='main1' class='col-md-8'></div>");
            rootElement.append("<div id='cart' class='col-md-4'></div>");
            $("#cart").append("<div id='main'></div>");
            $("#cart").append("<div id='items'></div>");

            this.setupProductComponent();
            this.setupCartMasterComponent();
        },
        render: function() {
            this.productComponent.renderList();
            this.cartMasterComponent.itemComponent.render();
        },
        setupProductComponent: function() {
            this.productComponent = new cartCp({componentId: this.componentId, el: "#main1"});
            this.productComponent.initialize();
            this.productComponent.listComponent.setSelection(true);
            this.productComponent.setReadOnly(true);
            this.productComponent.listComponent.addAction({
                name: 'addToCart',
                icon: '',
                displayName: 'Add to cart',
                show: true
            },
            this.addItem,
            this);
            
            this.productComponent.toolbarComponent.addButton({
                name: 'buy',
                icon: 'glyphicon-shopping-cart',
                displayName: 'Add to cart',
                show: true,
                menu: 'utils'
            },
            this.addToCart,
            this);
            
            this.productComponent.render("main1");
        },
        setupCartMasterComponent: function() {
            this.cartMasterComponent = new cartMasterCp({componentId: this.componentId});
            this.cartMasterComponent.initialize();
            this.cartMasterComponent.masterComponent.clearToolbar();
            this.cartMasterComponent.masterComponent.toolbarComponent.addButton({
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
            this.cartMasterComponent.masterComponent.render();
            this.cartMasterComponent.masterComponent.create();
            
            this.cartMasterComponent.itemComponent.displayToolbar(false);
            this.cartMasterComponent.itemComponent.disableEdit();
            this.cartMasterComponent.itemComponent.render("items");
            
        },
        addToCart: function() {
            var items = this.productComponent.listComponent.getSelectedItems();
            var idList = [];
            for (var property in items) {
                if (items.hasOwnProperty(property)) {
                    idList.push({productId: items[property].id});
                }
            }
            this.cartMasterComponent.addItems(idList);
            this.productComponent.listComponent.cleanSelected();
            this.render();
            
        },
        buy: function(){
            this.cartMasterComponent.masterComponent.save();
        },
        addItem: function(params){
            var item = this.productComponent.componentController.productModelList.get(params.id);
            this.cartMasterComponent.addItems([{productId: item.id}]);
            this.productComponent.listComponent.cleanSelected();
            this.render();
        }
    });
    return App.Component.CompositeComponent;
});