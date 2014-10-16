/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


define(['controller/tabController', 'component/cartComponent', 'component/itemComponent', 'controller/selectionController', 'model/cacheModel', 'model/cartMasterModel', 'component/_CRUDComponent'], function(TabController, CartComponent, itemComponent){
	App.Component._CartMasterComponent = App.Component.BasicComponent.extend({
		initialize: function () {
			var self = this;
			this.configuration = App.Utils.loadComponentConfiguration('cartMaster');
			App.Model.CartMasterModel.prototype.urlRoot = this.configuration.context;
			this.componentId = App.Utils.randomInteger();
			
			this.masterComponent = new CartComponent();
			this.masterComponent.initialize();
			
			this.childComponents = [];
			
			this.initializeChildComponents();
			
			Backbone.on(this.masterComponent.componentId + '-post-cart-create', function (params) {
				self.renderChilds(params);
			});
			Backbone.on(this.masterComponent.componentId + '-post-cart-edit', function (params) {
				self.renderChilds(params);
			});
			Backbone.on(this.masterComponent.componentId + '-pre-cart-list', function () {
				self.hideChilds();
			});
			Backbone.on('cart-master-model-error', function (error) {
				Backbone.trigger(this.masterComponent.componentId + '-' + 'error', {event: 'cart-master-save', view: self, message: error});
			});
			Backbone.on(this.masterComponent.componentId + '-instead-cart-save', function (params) {
				self.model.set('cartEntity', params.model);
				if (params.model) {
					self.model.set('id', params.model.id);
				} else {
					self.model.unset('id');
				}
				
				for (var idx in self.childComponents) {
					App.Utils.fillCacheList(
						self.childComponents[idx].name,
						self.model,
						self.childComponents[idx].getDeletedRecords(),
						self.childComponents[idx].getUpdatedRecords(),
						self.childComponents[idx].getCreatedRecords()
					);
				}
				
				self.model.save({}, {
					success: function () {
						Backbone.trigger(self.masterComponent.componentId + '-' + 'post-cart-save', {view: self, model: self.model});
					},
					error: function (error) {
						Backbone.trigger(self.componentId + '-' + 'error', {event: 'cart-master-save', view: self, error: error});
					}
				});
			});
			if (this.postInit) {
				this.postInit();
			}
		},
		render: function(domElementId){
			if (domElementId) {
				var rootElementId = $("#"+domElementId);
				this.masterElement = this.componentId + "-master";
				this.tabsElement = this.componentId + "-tabs";

				rootElementId.append("<div id='" + this.masterElement + "'></div>");
				rootElementId.append("<div id='" + this.tabsElement + "'></div>");
			}
			this.masterComponent.render(this.masterElement);
		},
		initializeChildComponents: function () {
			this.tabModel = new App.Model.TabModel({tabs: [{label: "Item", name: "item", enable: true}]});
			this.tabs = new TabController({model: this.tabModel});
			
			this.itemComponent = new itemComponent();
			this.itemComponent.initialize(
					{
						cache: {
							data: [],
							mode: "memory"
						},
						pagination: false
					});
			Backbone.on(this.itemComponent.componentId + '-post-item-create', function (params) {
				params.view.currentModel.setCacheList(params.view.currentList);
			});
			this.configToolbar(this.itemComponent, true);
			this.childComponents.push(this.itemComponent);
		},
		renderChilds: function (params) {
			var self = this;
			
			var options = {
				success: function () {
					self.tabs.render(self.tabsElement);
					for (var idx in self.childComponents) {
						var name = self.childComponents[idx].name;
						self.childComponents[idx].clearCache();
						self.childComponents[idx].setRecords(self.model.get('list'+name));
						self.childComponents[idx].render(self.tabs.getTabHtmlId(name));
					}
					$('#'+self.tabsElement).show();
				},
				error: function (error) {
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
					$("#"+this.masterElement).show();
				} else {
					$("#"+this.masterElement).hide();
				}
			}
		},
		hideChilds: function () {
			$("#"+this.tabsElement).hide();
		},
		configToolbar: function (component, composite) {
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
		},
		renderMaster: function(domElementId){
			this.masterComponent.render(domElementId);
		},
		renderChild: function(childName, domElementId){
			for (var idx in this.childComponents) {
				if (this.childComponents[idx].name === childName) {
					this.childComponents[idx].render(domElementId);
				}
			}
		}
	});
	return App.Component._CartMasterComponent;
});