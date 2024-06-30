$(function () {
    refreshTable();

    var dataTable = $('#table-user').DataTable({
        pageLength: 10,
        bLengthChange: false,
        columnDefs: [
            { targets: 'no-sort', orderable: false },
            { targets: 'no-wrap', className: 'text-nowrap' },
            { targets: '_all', className: 'text-start' },
        ],
        data: dataUser,
        columns: [
            { data: 'name' },
            { data: 'email' },
            {
                data: 'role',
                render: function (data, type) {
                    return statusBadge(data);
                }
            },
            {
                data: '',
                render: function (data, type, row) {
                    let action = `<a href="form-user.html?email=${row.email}" class="btn btn-sm btn-primary mx-1">Edit</a>`;
                    action += `<a href="javascript:void(0)" data-email="${row.email}" class="btn btn-sm btn-danger btn-delete">Delete</a>`;
                    return action;
                }
            },
        ],
    });

    function refreshTable() {
        const request = indexedDB.open('kertaskerja');
        request.onsuccess = (event) => {
            db = event.target.result;
            const userStore = db.transaction("users").objectStore("users");
            userStore.getAll().onsuccess = (event) => {
                dataUser = event.target.result;
                setTimeout(() => {
                    dataTable.clear();
                    dataTable.rows.add(dataUser);
                    dataTable.draw();
                }, 100);
            }
        };
    }
});