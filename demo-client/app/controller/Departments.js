 Ext.define('DemoClient.controller.Departments', {
    extend: 'Ext.app.Controller',
    init: function() {
        var me = this;
        me.callParent();
        var departmentStore = Ext.create('DemoClient.store.DepartmentStore'),
            departmentProxy = departmentStore.getProxy();
        departmentStore.on({
            scope: this,
            datachanged: 'onDepartmentStoreDataChanged',
            load: 'onDepartmentStoreLoad',
            write: 'onDepartmentStoreWrite'
        });
        departmentProxy.on({
            scope: this,
            exception: 'onDepartmentStoreException'
        });
    },
    onDepartmentStoreDataChanged: function(store, options) {
        var employeeGrid = Ext.ComponentQuery.query('employeegrid')[0],
            addButton = employeeGrid.down('button[itemId="add"]');
        if (store.getCount() > 0)
            addButton.enable();
        else
            addButton.disable();
        employeeGrid.getView().refresh();
        this.updateTotalLabel(store);
    },
    onDepartmentStoreLoad: function(store, records, successful) {
        store.updateEmployeeCounts();
    },
    onDepartmentStoreWrite: function(store, operation) {
        this.updateTotalLabel(store);
        store.load();
    },
    onDepartmentStoreException: function(proxy, response, operation, options) {
        var status = response.status,
            records = operation.getRecords(),
            record = records ? records[0] : undefined,
            store = Ext.getStore('DepartmentStore'),
            grid = Ext.ComponentQuery.query('departmentgrid')[0],
            index = record ? store.indexOf(record) : undefined,
            rowEditing = grid.getPlugin('rowEdit');
        if (operation.action == 'create' || operation.action == 'update') {
            if (status == 400)
                Ext.Msg.alert('DemoClient', 'Failed to save the department!<br/><br/>Please check that your data is valid and the name is unique.');
            else
                Ext.Msg.alert('DemoClient', 'The server failed to process your request.');
            rowEditing.startEdit(index, 1);
        } else if (operation.action == 'destroy') {
            Ext.Msg.alert('DemoClient', 'Failed to delete department.');
            store.load();
        }
    },
    updateTotalLabel: function(store) {
        var totalLabel = Ext.ComponentQuery.query('label[itemId="totalDepartments"]')[0];
        totalLabel.setText("Departments: " + store.getTotalCount());
    }
 });