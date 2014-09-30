define(['model/menuModel'], function() {
    App.Model.ToolbarModel = Backbone.Model.extend({
	    defaults : {
		    componentId : '',
		    name : '-',
		    title : '',
		    icon : 'globe',
		    showTitle : true,
		    menus : []
	    },
	    initialize : function() {
		    this.set('menus', new Array());
	    }
    });
    return App.Model.ToolbarModel;
});