var db;
var dataAtp = [];
var dataUser = [];
var user = localStorage.getItem('user');
var Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

$(function () {
    if (!user) {
        if (!window.location.href.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
    generateDatabase();
})

function generateDatabase() {
    const request = indexedDB.open('kertaskerja');
    request.onsuccess = (event) => {
        db = event.target.result;
    };
    request.onerror = (event) => {
        Swal.fire({
            icon: 'error',
            title: 'IndexedDB is blocked in your browser',
        });
    };
    request.onupgradeneeded = (event) => {
        db = event.target.result;

        const objectStoreUser = db.createObjectStore('users', { keyPath: 'email' });
        objectStoreUser.createIndex('name', 'name', { unique: false });
        objectStoreUser.createIndex('email', 'email', { unique: true });
        objectStoreUser.createIndex('password', 'password', { unique: false });
        objectStoreUser.createIndex('role', 'role', { unique: false });
        objectStoreUser.transaction.oncomplete = (event) => {
            const objectStore = db.transaction('users', 'readwrite').objectStore('users');
            objectStore.add({
                name: 'Regional Sumbagsel',
                email: 'sintia.aulia@tower-bersama.com',
                password: 'admin',
                role: 'admin'
            });
        }

        const objectStoreAtp = db.createObjectStore('atp', { keyPath: 'sonumb' });
        objectStoreAtp.createIndex('sonumb', 'sonumb', { unique: true });
        objectStoreAtp.createIndex('site_name', 'site_name', { unique: false });
        objectStoreAtp.createIndex('site_id', 'site_id', { unique: false });
        objectStoreAtp.createIndex('operator', 'operator', { unique: false });
        objectStoreAtp.createIndex('tower_type', 'tower_type', { unique: false });
        objectStoreAtp.createIndex('regency', 'regency', { unique: false });
        objectStoreAtp.createIndex('inviting_date', 'inviting_date', { unique: false });
        objectStoreAtp.createIndex('atp_date', 'atp_date', { unique: false });
        objectStoreAtp.createIndex('file', 'file', { unique: false });
        objectStoreAtp.createIndex('note', 'note', { unique: false });
        objectStoreAtp.createIndex('status', 'status', { unique: false });
        objectStoreAtp.createIndex('email', 'email', { unique: false });

        const objectStoreAtpHistories = db.createObjectStore('atp_histories', { keyPath: 'id' });
        objectStoreAtpHistories.createIndex('id', 'id', { unique: true });
        objectStoreAtpHistories.createIndex('sonumb', 'sonumb', { unique: false });
        objectStoreAtpHistories.createIndex('email', 'email', { unique: false });
        objectStoreAtpHistories.createIndex('status', 'status', { unique: false });
        objectStoreAtpHistories.createIndex('note', 'note', { unique: false });
        objectStoreAtpHistories.createIndex('file', 'file', { unique: false });
        objectStoreAtpHistories.createIndex('created_at', 'created_at', { unique: false });
    };
}