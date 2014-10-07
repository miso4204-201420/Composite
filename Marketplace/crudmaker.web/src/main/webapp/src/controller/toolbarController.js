define(['model/toolbarModel'], function () {
	App.Controller.ToolbarController = Backbone.View.extend({
		initialize: function () {
			App.Utils.loadTemplate('toolbar');
			this.template = _.template($('#toolbar-list-template').html());
			this.listenTo(this.model, 'change', this.render);
			this.renderOnChange = true;
		},
		render: function () {
			if (this.renderOnChange && this.model.get("show")) {
				this.$el.html(this.template(this.model.toJSON()));
			}
			return this;
		},
		setTemplate: function (templateName) {
			this.template = _.template($('#' + templateName).html());
			this.render();
		},
		addButton: function (params, callBack, context) {

			var button = new App.Model.ButtonModel({
				name: params.name,
				displayName: params.displayName,
				icon: params.icon,
				show: params.show
			});

			if (params.menu) {
				for (idx in this.model.get('menus')) {
					if (this.model.get('menus')[idx].get('name') == params.menu) {
						this.model.get('menus')[idx].get('buttons').push(button);
					}
				}
			} else {
				this.model.get('menus')[0].get('buttons').push(button);
			}

			Backbone.on(this.model.get('componentId') + '-toolbar-button-' + params.name, function (args) {
				callBack.call(context, args);
			});
			
			this.render();
		},
		removeButton: function (name) {
			for (i in this.model.get('menus')) {
				for (j in this.model.get('menus')[i].get('buttons')) {
					if (name == this.model.get('menus')[i].get('buttons')[j].get('name')) {
						Backbone.off(this.model.get('componentId') + '-toolbar-button-' + this.model.get('menus')[i].get('buttons')[j].get('name'));
						this.model.get('menus')[i].get('buttons').splice(j, 1);
						this.render();
					}
				}
			}
		},
		addMenu: function (params) {
			var newMenu = new App.Model.MenuModel({
				name: params.name,
				displayName: params.displayName,
				show: params.show
			});

			this.model.get('menus').push(newMenu);
			this.render();
		},
		removeMenu: function (name) {
			for (var i = 0; i < this.model.get('menus').length; i++) {
				if (name == this.model.get('menus')[i].get('name')) {
					for (var j = 0; j < this.model.get('menus')[i].get('buttons').length; j++) {
						Backbone.off(this.model.get('componentId') + '-toolbar-button-' + this.model.get('menus')[i].get('buttons')[j].get('name'));
					}
					this.model.get('menus').splice(i, 1);
					this.render();
				}
			}
		},
		showButton: function (name) {
			for (i in this.model.get('menus')) {
				for (j in this.model.get('menus')[i].get('buttons')) {
					if (name == this.model.get('menus')[i].get('buttons')[j].get('name')) {
						this.model.get('menus')[i].get('buttons')[j].set('show', true);
						this.render();
					}
				}
			}
		},
		hideButton: function (name) {
			for (i in this.model.get('menus')) {
				for (j in this.model.get('menus')[i].get('buttons')) {
					if (name == this.model.get('menus')[i].get('buttons')[j].get('name')) {
						this.model.get('menus')[i].get('buttons')[j].set('show', false);
						this.render();
					}
				}
			}
		},
		display: function (flag) {
			if (typeof (flag) === "boolean") {
				if (flag) {
					this.model.set("show",true);
					this.$el.show();
				} else {
					this.model.set("show",false);
					this.$el.hide();
				}
			} else {
				console.log("parameter value must be boolean type");
			}
		},
		updateUI: function(callback, context){
			this.renderOnChange = false;
			callback.call(context);
			this.renderOnChange = true;
			this.render();
		}
	});
	return App.Controller.ToolbarController;
});