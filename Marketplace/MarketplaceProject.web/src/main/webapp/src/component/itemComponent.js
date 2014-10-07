/* ========================================================================
 * Copyright 2014 MarketplaceGroup
 *
 * Licensed under the MIT, The MIT License (MIT)
 * Copyright (c) 2014 MarketplaceGroup
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 * ========================================================================
 
 
 Source generated by CrudMaker version 1.0.0.qualifier
 
 */
define(['component/_CRUDComponent', 'model/itemModel', 'controller/itemController'], function () {
    App.Component.ItemComponent = App.Component._CRUDComponent.extend({
        name: 'item',
        cacheMode: false,
        model: App.Model.ItemModel,
        listModel: App.Model.ItemList,
        controller: App.Controller.ItemController,
        postInit: function () {
            this.listComponent.addColumn('productId', 'Product Id');
            this.listComponent.addColumn('quantity', 'Quantity');
        },
        configCache : function(params){
            this.cacheMode = true;
             if (params && params.mode === "memory") {
                var itemModels = App.Utils.convertToModel(App.Utils.createCacheModel(App.Model.ItemModel), params.data);
                this.model = App.Utils.createCacheModel(App.Model.ItemModel);
                this.listModel = App.Utils.createCacheList(this.model, App.Model.ItemList, itemModels);
            } else {
                this.model = App.Model.ItemModel;
                this.listModel = App.Model.ItemList;
            }
        },
        changeCacheMode: function(params){
            this.configCache(params);
            this.componentController = new this.controller({modelClass: this.model, listModelClass: this.listModel, componentId: this.componentId, pageSize: this.pageSize});
        }
    });
    return App.Component.ItemComponent;
});