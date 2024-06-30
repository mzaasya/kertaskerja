$(function () {
    if (user.role !== 'admin') {
        $('#created-by').remove();
    }

    refreshTable();

    $('body').on('click', '.btn-status', function (e) {
        const sonumb = $(this).data('sonumb');
        const status = $(this).data('status');

        $('#modalStatusSonumb').val(sonumb);
        $('#modalStatusStatus').val(status);
        $('#modalStatusDate').val('');
        $('#modalStatusNote').val('');
        $('#modalStatusFile').val('');
        $('#modalStatusTitle').text('ATP ' + status[0].toUpperCase() + status.substring(1));
        $('#modalStatusConfirmation').text(`Change ATP status to ${status}?`);

        $('#modalStatusDate').removeClass('is-invalid');
        $('#modalStatusNote').removeClass('is-invalid');
        $('#modalStatusFile').removeClass('is-invalid');

        if (
            status === 'rejection' ||
            status === 'rectification'
        ) {
            $('#containerFile').removeClass('d-none');
            $('#containerNote').removeClass('d-none');
            $('#containerDate').addClass('d-none');
        } else if (status === 'confirmation') {
            $('#containerFile').addClass('d-none');
            $('#containerNote').addClass('d-none');
            $('#containerDate').removeClass('d-none');
        } else {
            $('#containerFile').addClass('d-none');
            $('#containerNote').addClass('d-none');
            $('#containerDate').addClass('d-none');
        }

        var modalStatus = new bootstrap.Modal(document.getElementById('modalStatus'));
        modalStatus.show();
    });

    $('body').on('click', '#btn-submit', function (e) {
        const sonumb = $('#modalStatusSonumb').val();
        const status = $('#modalStatusStatus').val();
        const atp_date = $('#modalStatusDate').val();
        const note = $('#modalStatusNote').val();
        const inputPath = $('#modalStatusFile').val();

        if (
            status === 'confirmation' &&
            !atp_date
        ) {
            $('#modalStatusDate').addClass('is-invalid');
            return;
        }

        if (status === 'rejection') {
            if (!inputPath) {
                $('#modalStatusFile').addClass('is-invalid');
                return;
            } else {
                $('#modalStatusFile').removeClass('is-invalid');
            }
            if (!note) {
                $('#modalStatusNote').addClass('is-invalid');
                return;
            } else {
                $('#modalStatusNote').removeClass('is-invalid');
            }
        }

        let file = '';
        if (inputPath) {
            const inputFiles = $('#modalStatusFile').prop('files');
            const files = Array.prototype.slice.call(inputFiles);
            const doc = files[0];
            if (doc) {
                const reader = new FileReader();
                reader.readAsDataURL(doc);
                reader.onload = () => {
                    file = reader.result;
                }
            }
        }

        $('#btn-submit').prop('disabled', true);
        $('#btn-submit').html('<span class="spinner-border spinner-border-sm"></span> Loading...');

        setTimeout(() => {
            setStatus({ sonumb, status, atp_date, note, file });
        }, 100);
    });

    $('body').on('click', '.btn-delete', function (e) {
        const sonumb = $(this).data('sonumb').toString();
        Swal.fire({
            title: 'Are you sure?',
            text: `Delete ATP ${sonumb}`,
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
                    db = event.target.result;
                    const objectStore = db.transaction("atp", 'readwrite').objectStore("atp");
                    objectStore.delete(sonumb).onsuccess = () => {
                        const histories = [];
                        const historyStore = db.transaction("atp_histories").objectStore("atp_histories");
                        historyStore.openCursor().onsuccess = (e) => {
                            const cursor = e.target.result;
                            if (cursor) {
                                if (cursor.value.sonumb === sonumb) {
                                    histories.push(cursor.key);
                                }
                                cursor.continue();
                            }
                        }
                        setTimeout(() => {
                            const historyStore = db.transaction("atp_histories", 'readwrite').objectStore("atp_histories");
                            histories.forEach(key => {
                                historyStore.delete(key);
                            });
                            setTimeout(() => {
                                localStorage.setItem('notif', JSON.stringify({
                                    icon: 'success',
                                    title: 'ATP has been deleted'
                                }));
                                window.location.reload();
                            }, 100);
                        }, 100);
                    }
                };
            }
        });
    });

    let columns = [
        {
            data: 'sonumb',
            render: function (data, type, row) {
                return `<a href="detail-atp.html?sonumb=${data}"><b>${data}</b></a>`;
            }
        },
        { data: 'site_name' },
        {
            data: 'inviting_date',
            render: function (data, type, row) {
                if (data) {
                    moment.locale('id');
                    data = moment(data).format('DD MMMM YYYY');
                }
                return data;
            }
        },
        {
            data: 'atp_date',
            render: function (data, type, row) {
                if (data) {
                    data = moment(data).format('DD MMMM YYYY');
                }
                return data;
            }
        },
    ];

    const secondColumns = [
        { data: 'user' },
    ];

    const thirdColumns = [
        {
            data: 'status',
            render: function (data, type, row) {
                return statusBadge(data);
            }
        },
        {
            data: '',
            render: function (data, type, row) {
                let action = '';
                if (
                    (
                        user.role === 'member' &&
                        _.includes(['invitation', 'pre atp'], row.status)
                    ) ||
                    (
                        user.role === 'admin' &&
                        row.status === 'pre atp'
                    )
                ) {
                    action += `<a href="form-atp.html?sonumb=${row.sonumb}" class="btn btn-sm btn-primary mx-1">Edit</a>`;
                }
                if (
                    (
                        row.status === 'invitation' &&
                        user.role === 'member'
                    ) ||
                    (
                        row.status === 'pre atp' &&
                        user.role === 'admin'
                    )
                ) {
                    action += `<a href="javascript:void(0)" data-sonumb="${row.sonumb}" class="btn btn-sm btn-danger btn-delete">Delete</a>`;
                }
                if (
                    user.role === 'admin' &&
                    row.status === 'invitation'
                ) {
                    action += `<a href="javascript:void(0)" data-sonumb="${row.sonumb}" data-status="confirmation" class="btn btn-sm btn-primary btn-status">Confirm</a>`;
                }
                if (
                    user.role === 'admin' &&
                    row.status === 'confirmation'
                ) {
                    action += `<a href="javascript:void(0)" data-sonumb="${row.sonumb}" data-status="on site" class="btn btn-sm btn-warning btn-status">On Site</a>`;
                }
                if (
                    user.role === 'member' &&
                    row.status === 'rejection'
                ) {
                    action += `<a href="javascript:void(0)" data-sonumb="${row.sonumb}" data-status="rectification" class="btn btn-sm btn-danger btn-status">Rectify</a>`;
                }
                if (
                    user.role === 'admin' &&
                    _.includes(['rectification', 'on site'], row.status)
                ) {
                    action += `<a href="javascript:void(0)" data-sonumb="${row.sonumb}" data-status="rejection" class="btn btn-sm btn-danger btn-status">Reject</a>`;
                    action += `<a href="javascript:void(0)" data-sonumb="${row.sonumb}" data-status="system" class="btn btn-sm btn-dark btn-status mx-1">System</a>`;
                }
                if (
                    user.role === 'admin' &&
                    row.status === 'system'
                ) {
                    action += `<a href="javascript:void(0)" data-sonumb="${row.sonumb}" data-status="done" class="btn btn-sm btn-success btn-status">Done</a>`;
                }
                return action;
            }
        },
    ];

    if (user.role === 'admin') {
        columns = columns.concat(secondColumns).concat(thirdColumns);
    } else {
        columns = columns.concat(thirdColumns);
    }

    var dataTable = $('#table-atp').DataTable({
        pageLength: 10,
        bLengthChange: false,
        columnDefs: [
            { targets: 'no-sort', orderable: false },
            { targets: 'no-wrap', className: 'text-nowrap' },
            { targets: '_all', className: 'text-start' },
        ],
        data: dataAtp,
        columns: columns,
    });

    function refreshTable() {
        const request = indexedDB.open('kertaskerja');
        request.onsuccess = (event) => {
            db = event.target.result;
            const atpStore = db.transaction("atp").objectStore("atp");
            atpStore.getAll().onsuccess = (event) => {
                const userStore = db.transaction("users").objectStore("users");
                dataAtp = event.target.result;
                if (user.role === 'member') {
                    dataAtp = _.filter(dataAtp, { email: user.email });
                }
                dataAtp.forEach(d => {
                    d.user = '';
                    userStore.get(d.email).onsuccess = (e) => {
                        const dataUser = e.target.result;
                        d.user = dataUser?.name ?? '';
                    }
                });
                setTimeout(() => {
                    dataTable.clear();
                    dataTable.rows.add(dataAtp);
                    dataTable.draw();
                }, 100);
            }
        };
    }

    function setStatus(data) {
        const email = user.email;
        const sonumb = data.sonumb;
        const status = data.status;
        const file = data.file ?? '';
        const note = data.note ?? '';
        const atp_date = data.atp_date ?? '';
        const request = indexedDB.open('kertaskerja');
        request.onsuccess = (event) => {
            db = event.target.result;
            const transaction = db.transaction(['atp', 'atp_histories'], 'readwrite');
            const atpStore = transaction.objectStore("atp");
            const historyStore = transaction.objectStore("atp_histories");
            atpStore.get(sonumb).onsuccess = (event) => {
                const atp = event.target.result;
                atp.status = status;
                if (atp_date) {
                    atp.atp_date = atp_date;
                }
                atpStore.put(atp);

                const users = [];
                const userStore = db.transaction("users").objectStore("users");
                const target = _.includes(['invitation', 'rectification'], status) ? 'admin' : 'member';
                userStore.getAll().onsuccess = (event) => {
                    const allUsers = event.target.result;
                    allUsers.forEach(d => {
                        if (d.role === target) {
                            users.push(d.email);
                        }
                    });
                }

                setTimeout(() => {
                    if (users.length > 0) {
                        delete atp.file;
                        createNotif(users, status, atp);
                    }
                }, 100);
            }
            historyStore.add({
                id: crypto.randomUUID(),
                sonumb,
                email,
                status,
                note,
                file,
                created_at: moment().toDate(),
            });
            setTimeout(() => {
                localStorage.setItem('notif', JSON.stringify({
                    icon: 'success',
                    title: 'ATP status has been changed'
                }));
                window.location.reload();
            }, 1000);
        }
    }
});
