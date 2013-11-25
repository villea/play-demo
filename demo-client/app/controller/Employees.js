 Ext.define('DemoClient.controller.Employees', {
    extend: 'Ext.app.Controller',
    init: function() {
        var me = this;
        me.callParent();
        var employeeStore = Ext.create('DemoClient.store.EmployeeStore'),
            employeeProxy = employeeStore.getProxy();
        employeeStore.on({
            scope: this,
            datachanged: 'onEmployeeStoreDataChanged',
            remove: 'onEmployeeStoreRemove',
            update: 'onEmployeeStoreUpdate',
            write: 'onEmployeeStoreWrite'
        });
        employeeProxy.on({
            scope: this,
            exception: 'onEmployeeStoreException'
        });
    },
    onEmployeeStoreDataChanged: function(store, options) {
        var depStore = Ext.getStore('DepartmentStore');
        depStore.updateEmployeeCounts();
        this.updateTotalLabel(store);
    },
    onEmployeeStoreException: function(proxy, response, operation, options) {
        var status = response.status,
            records = operation.getRecords(),
            record = records ? records[0] : undefined,
            store = Ext.getStore('EmployeeStore'),
            grid = Ext.ComponentQuery.query('employeegrid')[0],
            index = record ? store.indexOf(record) : undefined,
            rowEditing = grid.getPlugin('rowEdit');
        if (operation.action == 'create' || operation.action == 'update') {
            if (status == 400)
                Ext.Msg.alert('DemoClient', 'Failed to save the employee!<br/><br/>Please check that your data is valid (name is given, email is valid).');
            else
                Ext.Msg.alert('DemoClient', 'The server failed to process your request.');
            rowEditing.startEdit(index, 1);
        } else if (operation.action == 'destroy') {
            Ext.Msg.alert('DemoClient', 'Failed to delete employee.');
            store.load();
        }
    },
    onEmployeeStoreRemove: function(store, record) {
        store.sync();
    },
    onEmployeeStoreUpdate: function(store, record) {
        store.sync();
    },
    onEmployeeStoreWrite: function(store, operation) {
        this.updateTotalLabel(store);
        store.load();
    },
    updateTotalLabel: function(store) {
        var totalLabel = Ext.ComponentQuery.query('label[itemId="totalEmployees"]')[0];
        totalLabel.setText("Employees: " + store.getTotalCount());
    }
 });