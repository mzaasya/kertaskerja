$(function () {
    refreshTable();

    $('body').on('click', '.btn-delete', function (e) {
        const email = $(this).data('email');
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete user ${email}`,
            icon: 'error',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel',
            confirmButtonColor: '#f54242',
        }).then((result) => {
            if (result.isConfirmed) {
                const request = indexedDB.open('kertaskerja');
                request.onsuccess = (event) => {
                    let atp;
                    db = event.target.result;
                    const userStore = db.transaction('users', 'readwrite').objectStore("users");
                    const atpStore = db.transaction('atp').objectStore("atp");
                    const atpIndex = atpStore.index('email');
                    atpIndex.get(email).onsuccess = (e) => {
                        atp = e.target.result;
                    }
                    setTimeout(() => {
                        if (atp || email === user.email) {
                            Swal.fire({
                                title: 'This user cannot be deleted because it has ATP or current login user',
                                icon: 'error'
                            });
                        } else {
                            userStore.delete(email);
                            deleteUser(email);
                            setTimeout(() => {
                                localStorage.setItem('notif', JSON.stringify({
                                    icon: 'success',
                                    title: 'User has been deleted'
                                }));
                                window.location.reload();
                            }, 1000);
                        }
                    }, 10);
                };
            }
        });
    });

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