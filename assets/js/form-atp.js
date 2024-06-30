let dataSonumb;

$(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.has('sonumb')) {
        dataSonumb = params.get('sonumb');
        $('#header').text('Edit ATP ' + dataSonumb);
    }

    setupForm();

    $('#removeFile').on('click', function () {
        $('#file').val('');
    });

    $('#btn-submit').on('click', submit);
});

function submit() {
    user = localStorage.getItem('user');
    if (user) {
        user = JSON.parse(user);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has('sonumb')) {
        dataSonumb = params.get('sonumb');
    }

    const $sonumb = $('#sonumb');
    const $inviting_date = $('#inviting_date');
    const $email = $('#email');
    const $site_name = $('#site_name');
    const $site_id = $('#site_id');
    const $operator = $('#operator');
    const $tower_type = $('#tower_type');
    const $regency = $('#regency');
    const $note = $('#note');
    const $file = $('#file');

    const sonumb = $sonumb.val();
    const inviting_date = $inviting_date.val();
    let email = $email.val();
    const site_name = $site_name.val();
    const site_id = $site_id.val();
    const operator = $operator.val();
    const tower_type = $tower_type.val();
    const regency = $regency.val();
    const note = $note.val();
    const status = user.role === 'admin' ? 'pre atp' : 'invitation';

    if (user.role === 'member') {
        if (!inviting_date) {
            $inviting_date.addClass('is-invalid');
            return;
        }
        if (!$file.val()) {
            $file.addClass('is-invalid');
            return;
        }
    }
    if (user.role === 'admin') {
        if (!email) {
            $email.addClass('is-invalid');
            return;
        }
    } else {
        email = user.email;
    }
    if (!sonumb) {
        $sonumb.addClass('is-invalid');
        return;
    }
    if (!site_name) {
        $site_name.addClass('is-invalid');
        return;
    }
    if (!site_id) {
        $site_id.addClass('is-invalid');
        return;
    }
    if (!operator) {
        $operator.addClass('is-invalid');
        return;
    }
    if (!tower_type) {
        $tower_type.addClass('is-invalid');
        return;
    }
    if (!regency) {
        $regency.addClass('is-invalid');
        return;
    }

    let data = {
        sonumb,
        site_name,
        site_id,
        operator,
        tower_type,
        regency,
        inviting_date,
        atp_date: '',
        file: '',
        note,
        status,
        email,
    }

    const inputFiles = $('#file').prop('files');
    const files = Array.prototype.slice.call(inputFiles);
    const file = files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            data.file = reader.result;
        }
    }

    $('#btn-submit').prop('disabled', true);
    $('#btn-submit').html('<span class="spinner-border spinner-border-sm"></span> Loading...');

    setTimeout(() => {
        if (dataSonumb) {
            updateAtp(dataSonumb, data);
        } else {
            createAtp(data);
        }
    }, 100);
}

function setupForm() {
    if (user.role === 'admin') {
        $('#inviting-date-col').hide();
        const request = indexedDB.open('kertaskerja');
        request.onsuccess = (event) => {
            db = event.target.result;
            const objectStore = db.transaction('users', 'readwrite').objectStore('users');
            objectStore.getAll().onsuccess = (e) => {
                const users = e.target.result;
                const members = _.filter(users, { role: 'member' });
                let options = '';
                members.forEach(d => {
                    options += `<option value="${d.email}">${d.name}</option>`;
                });
                $('#email').html(options);
            }
        };
    } else {
        $('#email-col').hide();
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has('sonumb')) {
        dataSonumb = params.get('sonumb');
    }
    if (dataSonumb) {
        const request = indexedDB.open('kertaskerja');
        request.onsuccess = (event) => {
            db = event.target.result;
            const objectStore = db.transaction('atp', 'readwrite').objectStore('atp');
            const index = objectStore.index("sonumb");
            index.get(dataSonumb).onsuccess = (e) => {
                const atp = e.target.result;
                if (atp) {
                    $('#sonumb').val(atp.sonumb ?? '');
                    $('#sonumb').prop('readonly', true);
                    $('#inviting_date').val(atp.inviting_date ?? '');
                    $('#site_name').val(atp.site_name ?? '');
                    $('#site_id').val(atp.site_id ?? '');
                    $('#operator').val(atp.operator ?? '');
                    $('#tower_type').val(atp.tower_type ?? '');
                    $('#regency').val(atp.regency ?? '');
                    $('#note').val(atp.note ?? '');
                    if (atp.email) {
                        $('#email').val(atp.email).change();
                    }
                }
            }
        };
    }

}

function createAtp(data) {
    const history = {
        id: crypto.randomUUID(),
        sonumb: data.sonumb,
        email: data.email,
        status: data.status,
        note: data.note,
        file: data.file,
        created_at: moment().toDate(),
    }
    if (data.status === 'pre atp') {
        history.email = user.email;
    }
    const request = indexedDB.open('kertaskerja');
    request.onsuccess = (event) => {
        db = event.target.result;
        const transaction = db.transaction(['atp', 'atp_histories'], 'readwrite')
        const atpStore = transaction.objectStore('atp');
        const historyStore = transaction.objectStore('atp_histories');
        atpStore.add(data);
        historyStore.add(history);

        if (data.status === 'invitation') {
            let users = [];
            const userStore = db.transaction('users').objectStore('users');
            userStore.getAll().onsuccess = (e) => {
                const allUsers = e.target.result;
                allUsers.forEach(d => {
                    if (d.role === 'admin') {
                        users.push(d.email);
                    }
                });
            }
            setTimeout(() => {
                if (users.length > 0) {
                    delete data.file;
                    createNotif(users, data.status, data);
                }
            }, 1000);
        }

        setTimeout(() => {
            localStorage.setItem('notif', JSON.stringify({
                icon: 'success',
                title: 'ATP has been created'
            }));
            window.location.href = 'atp.html';
        }, 2000);
    };
}

function updateAtp(sonumb, data) {
    const request = indexedDB.open('kertaskerja');
    request.onsuccess = (event) => {
        db = event.target.result;
        const atpStore = db.transaction('atp', 'readwrite').objectStore('atp');
        atpStore.get(sonumb).onsuccess = (e) => {
            const currentAtp = e.target.result;

            if (
                currentAtp.status === 'pre atp' &&
                data.inviting_date
            ) {
                data.status = 'invitation';
                const historyStore = db.transaction('atp_histories', 'readwrite').objectStore('atp_histories');
                historyStore.add({
                    id: crypto.randomUUID(),
                    sonumb: data.sonumb,
                    email: data.email,
                    status: data.status,
                    note: data.note,
                    file: data.file,
                    created_at: moment().toDate(),
                });

                let users = [];
                const userStore = db.transaction('users').objectStore('users');
                userStore.getAll().onsuccess = (e) => {
                    const allUsers = e.target.result;
                    allUsers.forEach(d => {
                        if (d.role === 'admin') {
                            users.push(d.email);
                        }
                    });
                }
                setTimeout(() => {
                    if (users.length > 0) {
                        delete data.file;
                        createNotif(users, data.status, data);
                    }
                }, 1000);
            }

            atpStore.put(data);

            setTimeout(() => {
                localStorage.setItem('notif', JSON.stringify({
                    icon: 'success',
                    title: 'ATP has been updated'
                }));
                window.location.href = 'atp.html';
            }, 2000);
        }
    };
}
