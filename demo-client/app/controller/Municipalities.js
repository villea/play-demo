 Ext.define('DemoClient.controller.Municipalities', {
    extend: 'Ext.app.Controller',
    init: function() {
        var me = this;
        me.callParent();
        var municipalityStore = Ext.create('DemoClient.store.MunicipalityStore');
    }
 });