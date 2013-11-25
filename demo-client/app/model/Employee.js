Ext.define('DemoClient.model.Employee', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int', persist: false, useNull: true},
        {name: 'firstName', type: 'string'},
        {name: 'lastName', type: 'string'},
        {name: 'email', type: 'string'},
        {name: 'contractBeginDate', type: 'date', dateFormat: 'Y-m-d'},
        {name: 'birthMunicipalityId', type: 'int'},
        {name: 'departmentId', type: 'int'}
    ]
});