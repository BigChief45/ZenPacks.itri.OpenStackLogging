(function() {
    Ext.Loader.setConfig({
        enabled: true
    });
    
    Ext.application({
        name: 'Zenoss.OpenStackLogging',
        appFolder: "/++resource++openstack_logging/js/",
        launch: function() {
            // Test data
            var data = [
                ['ceph', 'cs:trusty/ceph-40', "kiva.png"],
                ['cinder', 'cs:trusty/cinder-29', 'yql.png'],
                ['pdcm', '', 'icons.png'],
                ['ceilometer', '', 'map.png'],
                ['keystone', '', 'tabs.png'],
                ['horizon', '', 'overlays.png'],
                ['nova', '', 'carousel.png']
            ];
        
           
            // Create the Model
            Ext.define('JujuService', {
                extend: 'Ext.data.Model',
                fields: ['name', 'charm', 'icon']
            });
             
            // Create the store
            var store = Ext.create('Ext.data.ArrayStore', {
                model: 'JujuService',
                storeId: 'servicesStore',
                data: data
            });
            
            // Create a dummy Grid Panel
            var test_panel = Ext.create('Ext.panel.Panel', {
                id: 'services-panel',
                title: 'Juju OpenStack Services',
                collapsible: false,
                width: 540,
                height: 580,
                padding: 40,
                border: true,
                layout: 'fit',
                items: Ext.create('Ext.view.View', {
                    store: store,
                    tpl: [
                        '<tpl for=".">',
                          '<div id="{name:stripTags}" class="col-md-2">',
                            '<img src="/++resource++openstack_logging/img/icons/services/{icon}" title="{name:htmlEncode}" class="img-responsive img-rounded center-block">',
                            '<h4 class="text-center">{name:htmlEncode}</h3>',
                          '</div>',
                        '</tpl>',
                        '<div class="x-clear"></div>'     
                    ],
                    multiSelect: false,
                    height: 580,
                    width: 540,
                    trackOver: true,
                    overItemCls: 'x-item-over',
                    itemSelector: 'div.thumb-wrap',
                    emptyText: 'No services to display',
                
                }) // Ext.create('Ext.view.View')
            }); // End test_panel

            // Insert it into the page's main grid
            Ext.getCmp('center_panel').add(test_panel);
            
        }, // end launch
                    
        setupEvents: function() {
        
        }
    }); // End Ext.application
        

})();
