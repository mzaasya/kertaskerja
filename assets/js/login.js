$(function () {
    if (user) {
        if (window.location.href.includes("login.html")) {
            window.location.href = "index.html";
        }
    }
    $('#btn-login').on('click', (e) => {
        const $email = $('#email');
        const $password = $('#password');
        const email = $email.val();
        const password = $password.val();

        $email.removeClass('is-invalid');
        $password.removeClass('is-invalid');

        if (email && password) {
            if (db) {
                const objectStore = db.transaction("users").objectStore("users");
                const index = objectStore.index("email");
                index.get(email).onsuccess = (event) => {
                    const data = event.target.result;
                    if (data && data.password === password) {
                        checkUser(email);
                        $('#btn-login').prop('disabled', true);
                        $('#btn-login').html('<span class="spinner-border spinner-border-sm"></span> Loading...');
                        setTimeout(() => {
                            localStorage.setItem('user', JSON.stringify(data));
                            window.location.href = 'index.html';
                        }, 1000);
                    } else {
                        let alert = '<div class="alert alert-danger alert-dismissible show">';
                        alert += 'The provided credentials do not match our records.';
                        alert += '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
                        $('#alert').html(alert);
                    }
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'IndexedDB is blocked in your browser',
                });
            }
        } else {
            if (!email) {
                $email.addClass('is-invalid');
            }
            if (!password) {
                $password.addClass('is-invalid');
            }
        }
    });
});