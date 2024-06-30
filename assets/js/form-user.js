let dataEmail;
const params = new URLSearchParams(window.location.search);
if (params.has('email')) {
    dataEmail = params.get('email');
    $('#header').text('Edit User ' + dataEmail);
    $('#email-note').text('email cannot be changed.');
}

$(function () {
    setupForm();

    $('#btn-submit').on('click', function () {
        const params = new URLSearchParams(window.location.search);
        if (params.has('email')) {
            dataEmail = params.get('email');
        }

        const name = $('#name').val();
        const role = $('#role').val();
        const email = $('#email').val();
        const password = $('#password').val();

        if (!name) {
            $('#name').addClass('is-invalid');
            return;
        } else {
            $('#name').removeClass('is-invalid');
        }

        if (
            !email &
            !dataEmail
        ) {
            $('#email').addClass('is-invalid');
            return;
        } else {
            $('#email').removeClass('is-invalid');
        }

        if (
            !password &
            !dataEmail
        ) {
            $('#password').addClass('is-invalid');
            return;
        } else {
            $('#password').removeClass('is-invalid');
        }

        if (dataEmail) {
            const data = { name, role };
            if (password) {
                data.password = password;
            }
            updateUser(dataEmail, data);
        } else {
            createUser({ name, role, email, password });
        }
    });
});

function createUser(data) {
    const request = indexedDB.open('kertaskerja');
    request.onsuccess = (event) => {
        db = event.target.result;
        const objectStore = db.transaction('users', 'readwrite').objectStore('users');
        objectStore.add(data).onsuccess = (e) => {
            checkUser(data.email);
            $('#btn-submit').prop('disabled', true);
            $('#btn-submit').html('<span class="spinner-border spinner-border-sm"></span> Loading...');
            setTimeout(() => {
                localStorage.setItem('notif', JSON.stringify({
                    icon: 'success',
                    title: 'User has been created'
                }));
                window.location.href = 'user.html';
            }, 1000);
        }
    }
}

function updateUser(email, data) {
    const request = indexedDB.open('kertaskerja');
    request.onsuccess = (event) => {
        db = event.target.result;
        const objectStore = db.transaction('users', 'readwrite').objectStore('users');
        objectStore.get(email).onsuccess = (e) => {
            const d = e.target.result;
            if (data.name) {
                d.name = data.name;
            }
            if (data.role) {
                d.role = data.role;
            }
            if (data.password) {
                d.password = data.password;
            }
            objectStore.put(d).onsuccess = () => {
                localStorage.setItem('notif', JSON.stringify({
                    icon: 'success',
                    title: 'User has been updated'
                }));
                window.location.href = 'user.html';
            }
        }
    }
}

function setupForm() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('email')) {
        dataEmail = params.get('email');
    }
    if (dataEmail) {
        const request = indexedDB.open('kertaskerja');
        request.onsuccess = (event) => {
            db = event.target.result;
            const objectStore = db.transaction('users').objectStore('users');
            const index = objectStore.index("email");
            index.get(dataEmail).onsuccess = (e) => {
                const dataUser = e.target.result;
                if (dataUser) {
                    $('#name').val(dataUser.name);
                    $('#email').val(dataUser.email);
                    $('#email').prop('readonly', true);
                    $('#role').val(dataUser.role).change();
                }
            }
        };
    }

}