define(['controller/selectionController', 'model/cacheModel', 'model/cartMasterModel', 'component/_CRUDComponent', 'controller/tabController', 'component/cartComponent',
    'component/itemComponent'

], function (SelectionController, CacheModel, CartMasterModel, CRUDComponent, TabController, CartComponent,
        itemComponent
        ) {
    App.Component.CartMasterComponent = App.Component.BasicComponent.extend({
        initialize: function () {
            var self = this;
            this.configuration = App.Utils.loadComponentConfiguration('cartMaster');
            var uComponent = new CartComponent();

            //modificado para composite
            this.masterComponent = uComponent;

            uComponent.initialize();
            uComponent.render('main');
            Backbone.on(uComponent.componentId + '-post-cart-create', function (params) {
                self.renderChilds(params);
            });
            Backbone.on(uComponent.componentId + '-post-cart-edit', function (params) {
                self.renderChilds(params);
            });
            Backbone.on(uComponent.componentId + '-pre-cart-list', function () {
                self.hideChilds();
            });
            Backbone.on('cart-master-model-error', function (error) {
                Backbone.trigger(uComponent.componentId + '-' + 'error', {event: 'cart-master-save', view: self, message: error});
            });
            Backbone.on(uComponent.componentId + '-instead-cart-save', function (params) {
                self.model.set('cartEntity', params.model);
                if (params.model) {
                    self.model.set('id', params.model.id);
                } else {
                    self.model.unset('id');
                }
                
                var itemModels = self.itemComponent.componentController.itemModelList;
                App.utils.divideCacheList('item',itemModels);
                self.model.set('listitem', []);
                self.model.set('createitem', []);
                self.model.set('updateitem', []);
                self.model.set('deleteitem', []);
                for (var i = 0; i < itemModels.models.length; i++) {
                    var m = itemModels.models[i];
                    var modelCopy = m.clone();
                    if (m.isCreated()) {
                        //set the id to null
                        modelCopy.unset('id');
                        self.model.get('createitem').push(modelCopy.toJSON());

                        //modificado para composite
                        m.created = false;

                    } else if (m.isUpdated()) {
                        self.model.get('updateitem').push(modelCopy.toJSON());
                    }
                }
                for (var i = 0; i < itemModels.deletedModels.length; i++) {
                    var m = itemModels.deletedModels[i];
                    self.model.get('deleteitem').push(m.toJSON());
                }
                self.model.save({}, {
                    success: function () {
                        Backbone.trigger(uComponent.componentId + '-' + 'post-cart-save', {view: self, model: self.model});
                    },
                    error: function (error) {
                        Backbone.trigger(self.componentId + '-' + 'error', {event: 'cart-master-save', view: self, error: error});
                    }
                });
            });
        },
        initializeChildComponents: function () {
            this.itemComponent = new itemComponent();
            this.itemComponent.initialize({cache: {data: this.model.get('listitem'), mode: "memory"}});
            this.itemComponent.setPageSize();
            this.itemComponent.listComponent.setData({pagination: false});
            this.itemComponent.render(this.tabs.getTabHtmlId('item'));
            Backbone.on(this.itemComponent.componentId + '-post-item-create', function (params) {
                params.view.currentItemModel.setCacheList(params.view.itemModelList);
            });
            this.resetToolbar(this.itemComponent, true);
        },
        renderChilds: function (params) {
            var self = this;
            this.tabModel = new App.Model.TabModel(
                    {
                        tabs: [
                            {label: "Item", name: "item", enable: true},
                        ]
                    }
            );

            this.tabs = new TabController({model: this.tabModel});

            this.tabs.render('tabs');
            App.Model.CartMasterModel.prototype.urlRoot = this.configuration.context;
            var options = {
                success: function () {
                    self.initializeChildComponents();
                    $('#tabs').show();
                },
                error: function () {
                    Backbone.trigger(self.componentId + '-' + 'error', {event: 'cart-edit', view: self, id: id, data: data, error: error});
                }
            };
            if (params.id) {
                self.model = new App.Model.CartMasterModel({id: params.id});
                self.model.fetch(options);
            } else {
                self.model = new App.Model.CartMasterModel();
                options.success();
            }


        },
        hideChilds: function () {
            $('#tabs').hide();
        },
        resetToolbar: function (component, composite) {
            component.toolbarComponent.removeButton('refresh');
            component.toolbarComponent.removeButton('print');
            component.toolbarComponent.removeButton('search');
            if (!composite) {
                component.toolbarComponent.removeButton('create');
                component.toolbarComponent.removeButton('save');
                component.toolbarComponent.removeButton('cancel');
                component.toolbarComponent.addButton({
                    name: 'add',
                    icon: 'glyphicon-send',
                    displayName: 'Add',
                    show: true
                }, function () {
                    Backbone.trigger(component.componentId + '-toolbar-add');
                });
            }
            component.toolbarComponent.render();
        },
        addItems: function (params) {
            var itemController = this.itemComponent.componentController;
            if (itemController.itemModelList === undefined) {
                itemController.itemModelList = new itemController.listModelClass();
            }
            var list = itemController.itemModelList;

            for (var idx in params) {
                var productId = params[idx].productId;
                var model = list.findWhere({productId: productId});
                if (model) {
                    var qty = model.get('quantity');
                    model.set({quantity: qty + 1, validate: true});
                } else {
                    var model = new itemController.modelClass();
                    model.set({productId: productId, quantity: 1});
                    model.setCacheList(list);
                }
                model.save({}, {});
            }
        }
    });

    return App.Component.CartMasterComponent;
});