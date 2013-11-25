Ext.define('DemoClient.view.DepartmentGrid', {
    extend: 'Ext.grid.Panel',
    requires: ['Ext.grid.plugin.RowEditing'],
    alias: 'widget.departmentgrid',
    plugins: [Ext.create('Ext.grid.plugin.RowEditing', {
        pluginId: 'rowEdit',
        listeners: {
            cancelEdit: function(rowEditing, context) {
                // Canceling editing of a locally added, unsaved record: remove it
                if (context.record.phantom) {
                    Ext.getStore('DepartmentStore').remove(context.record);
                }
            }
        }
    })],
    width: 400,
    autoScroll: true,
    padding: 5,
    frame: false,
    title: 'Departments',
    emptyText: 'Start by adding a department!',
    columns: [{
        text: 'ID',
        width: 30,
        sortable: true,
        dataIndex: 'id'
    }, {
        text: 'Department name',
        flex: 1,
        sortable: true,
        dataIndex: 'name',
        field: { xtype: 'textfield' }
    }, {
        text: 'Employees',
        flex: 1,
        sortable: true,
        dataIndex: 'employeeCount'
    }],
    dockedItems: [{
        xtype: 'toolbar',
        items: [{
            text: 'Add',
            handler: function(){
                // empty record
                var grid = this.up('gridpanel'),
                    store = grid.getStore(),
                    rowEditing = grid.getPlugin('rowEdit');
                store.insert(0, Ext.create('DemoClient.model.Department'));
                rowEditing.startEdit(0, 1);
            }
        }, {
            itemId: 'delete',
            text: 'Delete',
            disabled: true,
            handler: function(){
                var grid = this.up('gridpanel'),
                    store = grid.getStore(),
                    selection = grid.getView().getSelectionModel().getSelection()[0];
                if (selection.get('employeeCount') > 0)
                    Ext.Msg.alert('DemoClient', 'Department with employees assigned to it cannot be removed.');
                else {
                    Ext.Msg.confirm('DemoClient', 'Are you sure you want to delete the selected department?', function(btn) {
                        if (btn == 'yes') {
                            var grid = this.up('gridpanel'),
                                store = grid.getStore(),
                                selection = grid.getView().getSelectionModel().getSelection()[0];
                            if (store && selection) {
                                store.remove(selection);
                            }
                        }
                    }, this);
                }
            }
        }, '->', {
            xtype: 'label',
            itemId: 'totalDepartments',
            padding: '1 10 0 0'
        }]
    }]
});