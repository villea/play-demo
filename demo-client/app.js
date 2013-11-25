Ext.require([
	'Ext.data.*',
	'Ext.grid.*',
	'Ext.form.*',
	'DemoClient.model.Department',
	'DemoClient.store.DepartmentStore',
	'DemoClient.view.DepartmentGrid',
	'DemoClient.model.Employee',
	'DemoClient.store.EmployeeStore',
	'DemoClient.view.EmployeeGrid',
	'DemoClient.model.Municipality',
	'DemoClient.store.MunicipalityStore'
]);

Ext.Loader.setConfig({
    disableCaching: true
});

Ext.application({
    name: 'DemoClient',
    controllers: [
    	'DemoClient.controller.Departments',
    	'DemoClient.controller.Employees',
    	'DemoClient.controller.Municipalities'
    ],
    launch: function() {
	    var departmentGrid = Ext.create('DemoClient.view.DepartmentGrid', {store: 'DepartmentStore'}),
	    	employeeGrid = Ext.create('DemoClient.view.EmployeeGrid', {store: 'EmployeeStore'});

	    departmentGrid.getSelectionModel().on('selectionchange', function(selModel, selections){
	        departmentGrid.down('#delete').setDisabled(selections.length === 0);
	    });
	    employeeGrid.getSelectionModel().on('selectionchange', function(selModel, selections){
	        employeeGrid.down('#delete').setDisabled(selections.length === 0);
	    });

		// delay creation of viewport until required stores have been loaded
		var allStores = [Ext.getStore('DepartmentStore'), Ext.getStore('MunicipalityStore'), Ext.getStore('EmployeeStore')],
		    len = allStores.length,
		    loadedStores = 0,
		    i = 0;
		for (; i < len; ++i) {
		    allStores[i].on('load', check, null, {single: true});
		}
		function check() {
		    if (++loadedStores === len) {
		       initViewport();
		    }
		}
		function initViewport() {
			Ext.create('Ext.container.Viewport', {
				layout: {
					type: 'hbox',
					align: 'stretch'
				},
				items: [employeeGrid, departmentGrid]
			});
		}
    }
});