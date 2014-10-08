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
			this.childComponents = [];
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

				App.Utils.fillCacheList(
					'item',
					self.model,
					self.itemComponent.getDeletedRecords(),
					self.itemComponent.getUpdatedRecords(),
					self.itemComponent.getCreatedRecords()
				);
				
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
			this.itemComponent.initialize(
					{
						cache: {
							data: this.model.get('listitem'),
							mode: "memory"
						},
						pagination: false
					});
			// this.itemComponent.setPageSize();
			// this.itemComponent.listComponent.setData({pagination: false});
			Backbone.on(this.itemComponent.componentId + '-post-item-create', function (params) {
				params.view.currentModel.setCacheList(params.view.currentList);
			});
			this.resetToolbar(this.itemComponent, true);
			this.itemComponent.render(this.tabs.getTabHtmlId('item'));
			this.childComponents.push(this.itemComponent);
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
		showMaster: function (flag) {
			if (typeof (flag) === "boolean") {
				if (flag) {
					this.masterComponent.componentController.$el.show();
				} else {
					this.masterComponent.componentController.$el.hide();
				}
			}
		},
		hideChilds: function () {
			$('#tabs').hide();
		},
		resetToolbar: function (component, composite) {
			component.updateUI(function () {
				component.removeGlobalAction('refresh');
				component.removeGlobalAction('print');
				component.removeGlobalAction('search');
				if (!composite) {
					component.removeGlobalAction('create');
					component.removeGlobalAction('save');
					component.removeGlobalAction('cancel');
					component.addGlobalAction({
						name: 'add',
						icon: 'glyphicon-send',
						displayName: 'Add',
						show: true
					}, function () {
						Backbone.trigger(component.componentId + '-toolbar-add');
					});
				}
			},this);
		},
		addItems: function (params) {
			var list = this.itemComponent.getRecords();
			for (var idx in params) {
				var productId = params[idx].productId;
				var model = _.findWhere(list,{productId: productId});
				if (model) {
					model.quantity++
					this.itemComponent.updateRecord(model);
				} else {
					this.itemComponent.addRecords({productId: productId, quantity: 1}); 
				}
			}
		},
		getChilds: function(name){
			for (var idx in this.childComponents) {
				if (this.childComponents[idx].name === name) {
					return this.childComponents[idx].getRecords();
				}
			}
		},
		setChilds: function(childName,childData){
			for (var idx in this.childComponents) {
				if (this.childComponents[idx].name === childName) {
					this.childComponents[idx].setRecords(childData);
				}
			}
		}
	});
	return App.Component.CartMasterComponent;
});