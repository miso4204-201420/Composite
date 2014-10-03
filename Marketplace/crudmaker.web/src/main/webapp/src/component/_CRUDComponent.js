define(['controller/messageController','component/toolbarComponent','component/listComponent'], function(Messages) {
    App.Component.BasicComponent = function() {

    };
    App.Component.BasicComponent.extend = Backbone.View.extend;

    App.Component._CRUDComponent = App.Component.BasicComponent.extend({
        initialize: function(options) {
            var self = this;
            this.componentId = App.Utils.randomInteger();
            this.pageSize = 25;
            this.showToolbar = true;
            this.showList = true;
            this.configuration = App.Utils.loadComponentConfiguration(this.name);
            App.Utils.loadTemplate(this.name);
            this.model.prototype.urlRoot = this.configuration.context;
            this.listModel.prototype.url = this.configuration.context;
            this.el = this.configuration.el;
            if (options && options.cache) {
                this.configCache(options.cache);
            }
            this.componentController = new this.controller({modelClass: this.model, listModelClass: this.listModel, componentId: this.componentId, pageSize: this.pageSize});
            this.toolbarComponent = new App.Component.ToolbarComponent({componentId: this.componentId, name: this.name});
	    this.listComponent = new App.Component.ListComponent({componentId: this.componentId, name: this.name});
            Backbone.on(self.componentController.componentId + '-post-' + self.name + '-save', function(params) {
                self.toolbarComponent.hideButton('save');
		self.toolbarComponent.hideButton('cancel');
                self.componentController.list(params, self.list, self);
                var messagesController = new Messages({el: '#' + self.messageDomId});
                messagesController.showMessage('info', 'The ' + self.name + ' has been successfully saved.', true, 3);
            });
            Backbone.on(self.componentController.componentId + '-post-' + self.name + '-delete', function(params) {
                self.componentController.list(params, self.list, self);
                var messagesController = new Messages({el: '#' + self.messageDomId});
                messagesController.showMessage('info', 'The ' + self.name + ' has been successfully deleted.', true, 3);
            });
            Backbone.on(this.componentId + '-' + this.name + '-changePage', function(params) {
        		self.componentController.setPage(params.page);
        		self.componentController.list(null,self.list,self);
        	    });
            Backbone.on(self.componentController.componentId + '-error', function(params) {
                var messagesController = new Messages({el: '#' + self.messageDomId});
                var error = '';
                if (params.error) {
                    error = params.error.responseText;
                } else {
                    error = params.message;
                }
                messagesController.showMessage('danger', 'Error executing ' + params.event + ". Message: " + error, true);
            });
	    
	    this.loadToolbar();
	    this.loadListActions();
	    
            if (this.postInit) {
                this.postInit();
            }
        },
        render: function(domElementId) {
            var self = this;
            if (domElementId) {
                var rootElement = $('#' + domElementId);
                this.toolbarDomId = this.componentId + "-" + domElementId + "-toolbar";
                this.messageDomId = this.componentId + "-" + domElementId + "-messages";
                this.contentDomId = this.componentId + "-" + domElementId + "-content";
                rootElement.append("<div id=" + this.toolbarDomId + "></div>");
                rootElement.append("<div id=" + this.messageDomId + "></div>");
                rootElement.append("<div id=" + this.contentDomId + "></div>");
                this.toolbarComponent.toolbarController.setElement('#' + this.toolbarDomId);
                this.componentController.setElement('#' + this.contentDomId);
            }
            if (this.componentController._loadRequiredComponentsData) {
                this.componentController._loadRequiredComponentsData(function(){
                    if (self.showToolbar) {
                        self.toolbarComponent.toolbarController.render();
                    }
                    if (self.showList) {
                        self.componentController.list(null, self.list, self);
                    }
                });
            } else {
                if (this.showToolbar) {
                    this.toolbarComponent.toolbarController.render();
                }
                if (this.showList) {
                    this.componentController.list(null, this.list, this);
                }
            }
        },
	create: function(){
	    this.toolbarComponent.showButton('save');
	    this.toolbarComponent.showButton('cancel');
	    this.componentController.create();
	},
	save: function(params){
	    this.componentController.save();
	},
	cancel: function(params){
	    this.toolbarComponent.hideButton('save');
	    this.toolbarComponent.hideButton('cancel');
	    this.componentController.list(params, this.list, this);
	},
	refresh: function(params){
		this.componentController.setPage(1);
	    this.toolbarComponent.hideButton('save');
	    this.toolbarComponent.hideButton('cancel');
	    this.componentController.list(params, this.list, this);
	    var messagesController = new App.Controller.MessageController({el: '#' + this.messageDomId});
	    messagesController.showMessage('info', 'Data updated', true, 3);
	},
	search: function(){
	    
	},
	print: function(){
	    window.print();
	},
	edit: function(params){
	    this.toolbarComponent.showButton('save');
	    this.toolbarComponent.showButton('cancel');
	    this.componentController.edit(params);
	},
	delete: function(params){
	    this.componentController.destroy(params);
	},
	list: function(params){
	    this.currentPage = params.page;
	    this.pages = params.pages;
	    this.totalRecords = params.totalRecords;
	    this.listComponent.setData(params);
	    this.listComponent.changeElement('#' + this.contentDomId);
	    this.listComponent.render();
	},
	loadToolbar: function(){
	    this.toolbarComponent.addMenu({
		name: 'actions',
		displayName: 'Actions',
		show: true
	    });
	    
	    this.toolbarComponent.addButton({
		name: 'create', 
		icon: 'glyphicon-plus', 
		displayName: 'Create', 
		show: true
	    },
	    this.create,
	    this);
	    
	    this.toolbarComponent.addButton({
		name: 'save', 
		icon: 'glyphicon-floppy-disk', 
		displayName: 'Save', 
		show: false
	    },
	    this.save,
	    this);
	    
	    this.toolbarComponent.addButton({
		name: 'cancel', 
		icon: 'glyphicon-remove-sign', 
		displayName: 'Cancel', 
		show: false
	    },
	    this.cancel,
	    this);
	    
	    this.toolbarComponent.addButton({
		name: 'refresh', 
		icon: 'glyphicon-refresh', 
		displayName: 'Refresh', 
		show: true
	    },
	    this.refresh,
	    this);
	    
	    this.toolbarComponent.addMenu({
		name: 'utils',
		displayName: 'Utilities',
		show: true
	    });
	    
	    this.toolbarComponent.addButton({
		name: 'search', 
		icon: 'glyphicon-search', 
		displayName: 'Search', 
		show: true,
		menu: 'utils'
	    },
	    this.search,
	    this);
	    
	    this.toolbarComponent.addButton({
		name: 'print', 
		icon: 'glyphicon-print', 
		displayName: 'Print', 
		show: true,
		menu: 'utils'
	    },
	    this.print,
	    this);
	},
	loadListActions: function(){
	    this.listComponent.addAction({
		name: 'edit', 
		icon: '', 
		displayName: 'Edit', 
		show: true
	    },
	    this.edit,
	    this);
	    
	    this.listComponent.addAction({
		name: 'delete', 
		icon: '', 
		displayName: 'Delete', 
		show: true
	    },
	    this.delete,
	    this);
	},
        setPageSize: function (pageSize) {
            this.pageSize = pageSize;
            this.componentController.setPageSize(pageSize);
        },
        displayToolbar: function (flag) {
            if (typeof(flag) === "boolean") {
                this.showToolbar = flag;
                this.toolbarComponent.display(flag);
            }else {
                console.log("parameter value must be boolean type");
            }
        },
        displayList: function(flag){
            if (typeof(flag) === "boolean") {
                this.showList = flag;
                this.listComponent.display(flag);
            } else {
                console.log("parameter value must be boolean type");
            }
        },
        clearToolbar: function(){
            this.toolbarComponent.removeButton("create");
            this.toolbarComponent.removeButton("cancel");
            this.toolbarComponent.removeButton("save");
            this.toolbarComponent.removeButton("refresh");
            this.toolbarComponent.removeButton("print");
            this.toolbarComponent.removeButton("search");
        },
        clearListActions: function(){
            this.listComponent.removeAction("edit");
            this.listComponent.removeAction("delete");
        },
        setReadOnly: function(flag){
            if (typeof (flag) === 'boolean') {
                if (flag) {
                    this.listComponent.hideAction("edit");
                    this.listComponent.hideAction("delete");

                    this.toolbarComponent.hideButton("create");
                    this.toolbarComponent.hideButton("cancel");
                    this.toolbarComponent.hideButton("save");
                } else {
                    this.listComponent.showAction("edit");
                    this.listComponent.showAction("delete");

                    this.toolbarComponent.showButton("create");
                    this.toolbarComponent.showButton("cancel");
                    this.toolbarComponent.showButton("save");
                }
            } else {
                console.log("parameter value must be boolean type")
            }
        },
        disableEdit: function(){
            this.listComponent.removeAction("edit");
        },
        disableDelete: function(){
            this.listComponent.removeAction("edit");
        },
        renderList: function(){
            this.listComponent.render();
        }
    });
    return App.Component._CRUDComponent;
});