define(['model/_cartMasterModel'], function() { 
    App.Model.CartMasterModel = App.Model._CartMasterModel.extend({

    });

    App.Model.CartMasterList = App.Model._CartMasterList.extend({
        model: App.Model.CartMasterModel
    });

    return  App.Model.CartMasterModel;

});