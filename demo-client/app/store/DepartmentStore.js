Ext.define('DemoClient.store.DepartmentStore', {
    extend: 'Ext.data.Store',
    storeId: 'DepartmentStore',
    autoLoad: true,
    autoSync: true,
    model: 'DemoClient.model.Department',
    proxy: {
        type: 'rest',
        url: '/departments',
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
                id        = record ? record.getId() : operation.id;

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
            store.sort('name', 'ASC');
        }
    },
    updateEmployeeCounts: function() {
        var depEmps = {},
            empStore = Ext.getStore('EmployeeStore');
        function countDepartmentEmployees(record) {
            var dep = record.get('departmentId'),
                id = record.get('id'),
                depCount = dep ? depEmps[dep] : undefined;
            if (dep && id > 0) {
                if (depCount)
                    depEmps[dep]++;
                else
                    depEmps[dep] = 1;
            }
            return true;
        }
        empStore.data.each(countDepartmentEmployees);
        var depStore = this,
            currentFilter = empStore.filters.items[0],
            filteredDepartment = currentFilter ? currentFilter.value : undefined;
        function updateEmployeeCount(record) {
            var depId = record.get('id'),
                count = depEmps[depId];
            if (filteredDepartment == undefined || filteredDepartment == depId) {
                if (count)
                    record.set('employeeCount', count);
                else
                    record.set('employeeCount', 0);
            }
            return true;
        }
        depStore.data.each(updateEmployeeCount);
    }
});