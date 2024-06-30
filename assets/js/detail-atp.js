$(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.has('sonumb')) {
        dataSonumb = params.get('sonumb');
    }

    const request = indexedDB.open('kertaskerja');
    request.onsuccess = (event) => {
        db = event.target.result;
        const atpStore = db.transaction('atp', 'readwrite').objectStore('atp');
        atpStore.get(dataSonumb).onsuccess = (event) => {
            const data = event.target.result;
            $('#sonumb').val(data.sonumb);
            $('#site_name').val(data.site_name);
            $('#site_id').val(data.site_id);
            $('#operator').val(data.operator);
            $('#regency').val(data.regency);
            $('#email').val(data.email);
            $('#status').val(data.status.toUpperCase());
            $('#note').val(data.note);
            if (data.file) {
                $('#file').attr('href', data.file);
            }else{
                $('#file').prop('hidden', true);
            }
            if (data.inviting_date) {
                const date = moment(data.inviting_date).format('DD MMMM YYYY')
                $('#inviting_date').val(date);
            }
            if (data.atp_date) {
                const date = moment(data.atp_date).format('DD MMMM YYYY')
                $('#atp_date').val(date);
            }
        }

        const historyStore = db.transaction('atp_histories').objectStore('atp_histories');
        historyStore.getAll().onsuccess = (event) => {
            let tbody = '';
            const data = event.target.result;
            const history = _.sortBy(_.filter(data, { sonumb: dataSonumb }), 'created_at');
            const userStore = db.transaction('users').objectStore('users');
            history.forEach(d => {
                let file = '';
                let username = '';
                if (d.file) {
                    file = `<a href="${d.file}" class="btn btn-sm btn-primary" download="kertaskerja-atp">Download file</a>`;
                }
                if (d.email) {
                    userStore.get(d.email).onsuccess = (e) => {
                        const dataUser = e.target.result;
                        username = dataUser?.name ?? d.email;
                    }
                }
                setTimeout(() => {
                    tbody += `<tr>`;
                    tbody += `<td>${username}</td>`;
                    tbody += `<td>${d.note}</td>`;
                    tbody += `<td>${file}</td>`;
                    tbody += `<td>${statusBadge(d.status)}</td>`;
                    tbody += `<td>${moment(d.created_at).format('DD MMMM YYYY HH:mm')}</td>`;
                    tbody += `</t>`;
                }, 10);
            });
            setTimeout(() => {
                $('#tbody').html(tbody);
            }, 100);
        }
    }
});