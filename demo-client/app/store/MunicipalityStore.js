Ext.define('DemoClient.store.MunicipalityStore', {
    extend: 'Ext.data.Store',
    storeId: 'MunicipalityStore',
    autoLoad: true,
    autoSync: false,
    model: 'DemoClient.model.Municipality',
    proxy: {
        type: 'rest',
        url: '/municipalities',
        noCache: false,
        pageParam: undefined,
        startParam: undefined,
        limitParam: undefined,
        simpleSortMode: true,
        reader: {
            type: 'json',
            root: 'records'
        },
        writer: undefined
    }
});