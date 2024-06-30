var onesignal = {
    url: 'https://api.onesignal.com/apps/',
    url_notif: 'https://onesignal.com/api/v1/notifications',
    app_id: "",
    api_key: "",
    template_id: ""
}

function checkUser(email) {
    $.ajax({
        url: onesignal.url + onesignal.app_id + '/users/by/external_id/' + email,
        method: 'get',
        dataType: 'json',
        success: (res) => {
            if (
                res &&
                res.subscriptions
            ) {
                const emailSubs = _.find(res.subscriptions, { type: 'Email' });
                if (
                    emailSubs &&
                    emailSubs.token != email
                ) {
                    createUser(email);
                }
            }
        },
        error: (res) => {
            if (res.status === 404) {
                createUser(email);
            }
        }
    });
}

function createUser(email) {
    const data = {
        identity: {
            external_id: email
        },
        subscriptions: [{
            type: 'Email',
            token: email
        }]
    }
    $.ajax({
        url: onesignal.url + onesignal.app_id + '/users',
        method: 'post',
        dataType: 'json',
        data: JSON.stringify(data)
    });
}

function createNotif(users, status, payload) {
    payload.inviting_date = moment(payload.inviting_date).format('DD MMMM YYYY');
    const headers = {
        'Authorization': 'Basic ' + onesignal.api_key,
        'accept': 'application/json',
        'content-type': 'application/json'
    }
    const data = {
        app_id: onesignal.app_id,
        template_id: onesignal.template_id,
        channel_for_external_user_ids: 'email',
        include_external_user_ids: users,
        custom_data: emailData(status, payload)
    }
    $.ajax({
        url: onesignal.url_notif,
        method: 'post',
        dataType: 'json',
        crossDomain: true,
        headers: headers,
        data: JSON.stringify(data)
    });
}

function emailData(status, payload) {
    const data = {
        object: '',
        header: '',
        footer: '',
        task: payload
    }

    switch (status) {
        case 'invitation':
            data['object'] = 'CME';
            data['header'] = 'undangan ATP (Inviting ATP), berikut :';
            data['footer'] = 'Mohon dibantu konfirmasi untuk ATP site berikut';
            break;
        case 'confirmation':
            data['object'] = 'Vendor';
            data['header'] = 'konfirmasi ATP (Confirmation ATP), berikut :';
            data['footer'] = 'Mohon disiapkan semua keperluan ketika ATP on site';
            break;
        case 'on site':
            data['object'] = 'Vendor';
            data['header'] = 'konfirmasi ATP on site, berikut :';
            data['footer'] = 'Mohon disiapkan semua keperluan saat ATP on site';
            break;
        case 'rejection':
            data['object'] = 'Vendor';
            data['header'] = 'rektifikasi ATP (Rectification ATP), berikut :';
            data['footer'] = 'Mohon dilakukan perbaikan selambatnya H+3 setelah ATP on site';
            break;
        case 'rectification':
            data['object'] = 'CME';
            data['header'] = 'rektifikasi ATP (Rectification ATP) berikut telah diperbaiki';
            data['footer'] = 'Mohon dilakukan pemeriksaan ATP yang telah diperbaiki';
            break;
        case 'system':
            data['object'] = 'Vendor';
            data['header'] = 'ATP site berikut diterima';
            data['footer'] = 'Mohon dilakukan input system sesuai dengan format yang telah disetujui';
            break;
        case 'done':
            data['object'] = 'Vendor';
            data['header'] = 'ATP site berikut telah selesai';
            data['footer'] = 'Terimakasih telah melakukan serangkaian kegiatan ATP dengan memperhatikan keselamatan kerja';
            break;
    }

    return data;
}