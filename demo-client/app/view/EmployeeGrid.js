Ext.define('DemoClient.view.EmployeeGrid', {
    extend: 'Ext.grid.Panel',
    requires: ['Ext.grid.plugin.RowEditing'],
    alias: 'widget.employeegrid',
    plugins: [Ext.create('Ext.grid.plugin.RowEditing', {
        pluginId: 'rowEdit',
        clicksToEdit: 2,
        errorSummary: true,
        listeners: {
            cancelEdit: function(rowEditing, context) {
                // Canceling editing of a locally added, unsaved record: remove it
                if (context.record.phantom) {
                    Ext.getStore('EmployeeStore').remove(context.record);
                }
            }
        }
    })],
    autoScroll: true,
    flex: 1,
    padding: 5,
    minHeight: 260,
    frame: false,
    title: 'Employees',
    columns: [{
        text: 'ID',
        width: 30,
        sortable: true,
        dataIndex: 'id'
    },{
        text: 'First name',
        flex: 1,
        sortable: true,
        dataIndex: 'firstName',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Last name',
        flex: 1,
        sortable: true,
        dataIndex: 'lastName',
        editor: {
            xtype: 'textfield'
        }
    },{
        text: 'Email',
        flex: 1,
        sortable: true,
        dataIndex: 'email',
        editor: {
            xtype: 'textfield'
        }
    },{
        xtype: 'datecolumn',
        header: 'Contract begin date',
        dataIndex: 'contractBeginDate',
        sortable: true,
        flex: 1,
        format: 'Y-m-d',
        editor: {
            xtype: 'datefield',
            format: 'Y-m-d'
        }
    },{
        text: 'Department',
        flex: 1,
        sortable: true,
        dataIndex: 'departmentId',
        renderer: function(value) {
            if (value == 0)
                return "";
            else {
                var store = Ext.getStore('DepartmentStore'),
                    elem = store ? store.getById(value) : undefined,
                    name = elem ? elem.get('name') : undefined;
                if (name)
                    return name;
                else
                    return "";
            }
        },
        editor: {
            xtype: 'combobox',
            forceSelection: true,
            typeAhead: true,
            triggerAction: 'all',
            queryMode: 'local',
            selectOnTab: true,
            store: 'DepartmentStore',
            displayField: 'name',
            valueField: 'id',
            lazyRender: true
        }
    },{
        text: 'Birth municipality',
        flex: 1,
        sortable: true,
        dataIndex: 'birthMunicipalityId',
        renderer: function(value) {
            if (value == 0)
                return "";
            else {
                var store = Ext.getStore('MunicipalityStore'),
                    elem = store ? store.getById(value) : undefined,
                    name = elem ? elem.get('name') : undefined;
                if (name)
                    return name;
                else
                    return "";
            }
        },
        editor: {
            xtype: 'combobox',
            forceSelection: true,
            typeAhead: true,
            triggerAction: 'all',
            queryMode: 'local',
            selectOnTab: true,
            store: 'MunicipalityStore',
            displayField: 'name',
            valueField: 'id',
            lazyRender: true
        }
    }],
    dockedItems: [{
        xtype: 'toolbar',
        items: [{
                xtype: 'combobox',
                fieldLabel: 'Filter by department',
                itemId: 'DepartmentFilter',
                labelWidth: 110,
                width: 250,
                padding: '0 0 0 25',
                allowBlank: true,
                forceSelection: true,
                typeAhead: true,
                triggerAction: 'all',
                queryMode: 'local',
                selectOnTab: true,
                store: 'DepartmentStore',
                displayField: 'name',
                valueField: 'id',
                lazyRender: true,
                listeners: {
                    change: function(combo, newValue, oldValue, options) {
                        var empStore = Ext.getStore('EmployeeStore');
                        empStore.clearFilter(true);
                        if (newValue != '' && newValue != null)
                            empStore.filter('departmentId', newValue);
                        else
                            empStore.load();
                    }
                }
            },{
                xtype: 'button',
                text: 'Clear filter',
                handler: function(button) {
                    var toolbar = this.up('toolbar'),
                        filterCombo = toolbar ? toolbar.down('combobox[itemId="DepartmentFilter"]') : undefined;
                    if (filterCombo)
                        filterCombo.clearValue();
                }
            },'->',{
            text: 'Add',
            itemId: 'add',
            disabled: true,
            handler: function(){
                // empty record
                var grid = this.up('gridpanel'),
                    store = grid.getStore(),
                    depStore = Ext.getStore('DepartmentStore'),
                    defaultDep = depStore.getAt(0),
                    munStore = Ext.getStore('MunicipalityStore'),
                    defaultMun = munStore.getAt(0),
                    rowEditing = grid.getPlugin('rowEdit');
                var newEmp = Ext.create('DemoClient.model.Employee', {
                    contractBeginDate: Ext.Date.clearTime(new Date()),
                    departmentId: defaultDep.get('id'),
                    birthMunicipalityId: defaultMun.get('id')
                })
                store.insert(0, newEmp);
                rowEditing.startEdit(0, 1);
            }
        }, {
            itemId: 'delete',
            text: 'Delete',
            disabled: true,
            handler: function(){
                Ext.Msg.confirm('DemoClient', 'Are you sure you want to delete the selected employee?', function(btn) {
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
        }, {
            xtype: 'label',
            itemId: 'totalEmployees',
            padding: '1 10 0 30'
        }]
    }]
});