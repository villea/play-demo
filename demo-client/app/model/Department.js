Ext.define('DemoClient.model.Department', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int', persist: false, useNull: true},
        {name: 'name', type: 'string'},
        {name: 'employeeCount', type: 'int', persist: false}
    ],
    validations: [
        {type: 'length', field: 'name', min: 1, max: 255},
        {type: 'presence', field: 'name'}
    ]
});