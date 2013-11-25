Ext.define('DemoClient.store.EmployeeStore', {
    extend: 'Ext.data.Store',
    storeId: 'EmployeeStore',
    autoLoad: true,
    autoSync: false,
    remoteFilter: true,
    model: 'DemoClient.model.Employee',
    proxy: {
        type: 'rest',
        url: '/employees',
        appendId: false,
        noCache: false,
        pageParam: undefined,
        startParam: undefined,
        limitParam: undefined,
        sortParam: undefined,
        directionParam: undefined,
        simpleSortMode: true,
        reader: {
            type: 'json',
            root: 'records'
        },
        writer: {
            type: 'json'
        },
        buildUrl: function(request) {
            var me        = this,
                operation = request.operation,
                records   = operation.records || [],
                record    = records[0],
                format    = me.format,
                action    = operation.action,
                url       = me.getUrl(request),
                id        = record ? record.getId() : operation.id,
                filters   = operation.filters;

            if (action == 'read' && filters) {
                if (filters.length > 0)
                    url += '?'
                for (var i = 0; i < filters.length; i++) {
                    var prop = filters[i].property,
                        value = filters[i].value;
                    if (prop && value) {
                        var filterString = prop + "=" + value;
                        if (url.slice(url.length-1) === '?') {
                            url += filterString;
                        } else {
                            url += '&' + filterString;
                        }
                    }
                }
                delete request.params['filter'];
            };

            if (me.appendId && me.isValidId(id) || (action == "destroy" || action == "update")) {
                if (!url.match(/\/$/)) {
                    url += '/';
                }

                url += id;
            }

            if (format) {
                if (!url.match(/\.$/)) {
                    url += '.';
                }

                url += format;
            }

            request.url = url;

            return url;
        }
    },
    listeners: {
        write: function(store, operation){
            var record = operation.getRecords()[0],
                name = Ext.String.capitalize(operation.action),
                verb;
            if (name == 'Create') {
                record.data['id'] = parseInt(operation.response.responseText);
            }
            store.sort('lastName', 'ASC');
        }
    }
});