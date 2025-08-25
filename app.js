// Konfigurasi Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyA9BCmseAC0gkE9ES3tXwSKOK349Fbq2Tw",
    authDomain: "streamingtv-b9cb4.firebaseapp.com",
    databaseURL: "https://streamingtv-b9cb4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "streamingtv-b9cb4",
    storageBucket: "streamingtv-b9cb4.appspot.com",
    messagingSenderId: "1073845672663",
    appId: "1:1073845672663:web:4b9e31e7f238647d09ee92",
    measurementId: "G-MC2JFFL153"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const remoteConfig = firebase.remoteConfig();

// Dapatkan semua elemen HTML yang kita butuhkan
const authContainer = document.getElementById('auth-container');
const dashboardContent = document.getElementById('dashboard-content');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const adminEmailInput = document.getElementById('admin-email');
const adminPasswordInput = document.getElementById('admin-password');
const authError = document.getElementById('auth-error');
const adminUserEmail = document.getElementById('admin-user-email');
const pendingListContainer = document.getElementById('pending-requests-list');
const activeDevicesContainer = document.getElementById('active-devices-list');
const playlistEditorContainer = document.getElementById('playlist-editor-container');
const addCategoryBtn = document.getElementById('add-category-btn');
const channelModal = document.getElementById('channel-modal');
const modalTitle = document.getElementById('modal-title');
const channelForm = document.getElementById('channel-form');
const cancelChannelBtn = document.getElementById('cancel-channel-btn');
const modalCategoryId = document.getElementById('modal-category-id');
const modalChannelId = document.getElementById('modal-channel-id');
const modalChannelName = document.getElementById('modal-channel-name');
const modalChannelDescription = document.getElementById('modal-channel-description');
const modalStreamUrl = document.getElementById('modal-stream-url');
const modalLogoUrl = document.getElementById('modal-logo-url');
const modalDrmScheme = document.getElementById('modal-drm-scheme');
const modalDrmLicense = document.getElementById('modal-drm-license');

// Pantau status otentikasi
auth.onAuthStateChanged(user => {
    if (user) {
        authContainer.style.display = 'none';
        dashboardContent.style.display = 'block';
        adminUserEmail.textContent = user.email;
        loadPendingRequests();
        loadActiveDevices();
        loadRemoteConfigInfo();
        loadPlaylistEditor();
    } else {
        authContainer.style.display = 'block';
        dashboardContent.style.display = 'none';
    }
});

// Tambahkan semua event listener
loginButton.addEventListener('click', () => {
    const email = adminEmailInput.value;
    const password = adminPasswordInput.value;
    authError.textContent = '';
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            console.error("Login Gagal:", error);
            authError.textContent = "Email atau password salah.";
        });
});
logoutButton.addEventListener('click', () => { auth.signOut(); });
addCategoryBtn.addEventListener('click', () => {
    const categoryName = prompt("Masukkan nama kategori baru:");
    if (categoryName && categoryName.trim() !== '') {
        saveCategory(categoryName.trim());
    }
});
cancelChannelBtn.addEventListener('click', () => { channelModal.style.display = 'none'; });
channelForm.addEventListener('submit', (event) => {
    event.preventDefault();
    saveChannel();
});

playlistEditorContainer.addEventListener('click', (event) => {
    const target = event.target;
    const categoryId = target.getAttribute('data-category-id');
    const channelId = target.getAttribute('data-channel-id');
    if (!categoryId) return;

    if (target.classList.contains('add-channel-btn')) {
        openChannelModal('add', categoryId);
    } else if (target.classList.contains('delete-category-btn')) {
        if (confirm(`Yakin ingin menghapus kategori ini beserta semua channel di dalamnya?`)) {
            deleteCategory(categoryId);
        }
    } else if (target.classList.contains('edit-channel-btn')) {
        database.ref(`playlist/${categoryId}/channels/${channelId}`).once('value', (snapshot) => {
            openChannelModal('edit', categoryId, channelId, snapshot.val());
        });
    } else if (target.classList.contains('delete-channel-btn')) {
        if (confirm(`Yakin ingin menghapus channel ini?`)) {
            deleteChannel(categoryId, channelId);
        }
    } else if (target.classList.contains('move-up-btn')) {
        moveChannel(categoryId, channelId, 'up');
    } else if (target.classList.contains('move-down-btn')) {
        moveChannel(categoryId, channelId, 'down');
    }
});

activeDevicesContainer.addEventListener('click', (event) => {
    const target = event.target;
    const deviceId = target.getAttribute('data-device-id');
    const action = target.getAttribute('data-action');
    if (action === 'revoke') {
        if (confirm(`Yakin ingin mencabut akses untuk perangkat ${deviceId}?`)) {
            revokeAccess(deviceId);
        }
    }
});

pendingListContainer.addEventListener('click', (event) => {
    const target = event.target;
    const deviceId = target.getAttribute('data-device-id');
    if (!deviceId) return;
    if (target.classList.contains('approve-btn')) {
        const userName = document.getElementById(`name-${deviceId}`).value;
        const keyFragment = document.getElementById(`key-${deviceId}`).value;
        const duration = document.getElementById(`duration-${deviceId}`).value;
        const unit = document.getElementById(`unit-${deviceId}`).value;
        if (!userName || !duration || !keyFragment) {
            alert('Nama, Kunci Rahasia, dan Durasi harus diisi!');
            return;
        }
        approveRequest(deviceId, userName, keyFragment, duration, unit);
    }
    if (target.classList.contains('reject-btn')) {
        if (confirm(`Yakin ingin menolak permintaan untuk ${deviceId}?`)) {
            rejectRequest(deviceId);
        }
    }
});


// --- FUNGSI-FUNGSI UTAMA ---

function loadPlaylistEditor() {
    const playlistRef = database.ref('playlist').orderByChild('order');
    playlistRef.on('value', (snapshot) => {
        playlistEditorContainer.innerHTML = '';
        if (snapshot.exists()) {
            snapshot.forEach((categorySnapshot) => {
                const categoryId = categorySnapshot.key;
                const categoryData = categorySnapshot.val();

                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';

                let channelsHtml = '';
                if (categoryData.channels) {
                    const sortedChannels = Object.entries(categoryData.channels).sort(([, a], [, b]) => (a.order || 0) - (b.order || 0));
                    for (const [channelId, channelData] of sortedChannels) {
                        channelsHtml += `<div class="channel-item"><span>${channelData.channelName}</span><div class="channel-actions"><button class="approve-btn move-up-btn" data-category-id="${categoryId}" data-channel-id="${channelId}">▲</button><button class="approve-btn move-down-btn" data-category-id="${categoryId}" data-channel-id="${channelId}">▼</button><button class="approve-btn edit-channel-btn" data-category-id="${categoryId}" data-channel-id="${channelId}">Edit</button><button class="reject-btn delete-channel-btn" data-category-id="${categoryId}" data-channel-id="${channelId}">X</button></div></div>`;
                    }
                }

                categoryItem.innerHTML = `<div class="category-header"><h3>${categoryData.category_name} (Urutan: ${categoryData.order})</h3><div class="category-actions"><button class="approve-btn add-channel-btn" data-category-id="${categoryId}">+ Channel</button><button class="reject-btn delete-category-btn" data-category-id="${categoryId}">X Kategori</button></div></div><div class="channel-list">${channelsHtml || '<p>Belum ada channel di kategori ini.</p>'}</div>`;
                playlistEditorContainer.appendChild(categoryItem);
            });
        } else {
            playlistEditorContainer.innerHTML = '<p>Belum ada kategori. Silakan tambahkan kategori baru.</p>';
        }
    });
}

// Fungsi baru untuk membuka modal
function openChannelModal(mode, categoryId, channelId = null, data = {}) {
    channelForm.reset();
    modalCategoryId.value = categoryId;
    modalChannelId.value = channelId || '';
    modalTitle.textContent = (mode === 'edit') ? 'Edit Channel' : 'Tambah Channel Baru';

    if (mode === 'edit') {
        modalChannelName.value = data.channelName || '';
        modalChannelDescription.value = data.description || '';
        modalStreamUrl.value = data.streamUrl || '';
        modalLogoUrl.value = data.logoUrl || '';
        if (data.drm) {
            modalDrmScheme.value = data.drm.scheme || '';
            modalDrmLicense.value = data.drm.licenseUrl || '';
        }
    }
    channelModal.style.display = 'flex';
}

function saveCategory(categoryName) {
    const playlistRef = database.ref('playlist');
    playlistRef.once('value', (snapshot) => {
        const newOrder = snapshot.numChildren() + 1;
        playlistRef.push().set({
            category_name: categoryName,
            order: newOrder
        });
    });
}

function deleteCategory(categoryId) {
    database.ref(`playlist/${categoryId}`).remove()
        .then(() => alert('Kategori berhasil dihapus.'))
        .catch(error => alert('Gagal menghapus kategori: ' + error.message));
}

function saveChannel() {
    const categoryId = modalCategoryId.value;
    let channelId = modalChannelId.value;

    const channelData = {
        channelName: modalChannelName.value,
        description: modalChannelDescription.value,
        streamUrl: modalStreamUrl.value,
        logoUrl: modalLogoUrl.value,
    };

    const drmScheme = modalDrmScheme.value.trim();
    const drmLicense = modalDrmLicense.value.trim();
    if (drmScheme && drmLicense) {
        channelData.drm = { scheme: drmScheme, licenseUrl: drmLicense };
    }

    if (channelId) { // Mode Edit
        database.ref(`playlist/${categoryId}/channels/${channelId}/order`).once('value', (snapshot) => {
            channelData.order = snapshot.val() || Date.now();
            database.ref(`playlist/${categoryId}/channels/${channelId}`).update(channelData)
                .then(() => { channelModal.style.display = 'none'; alert('Channel berhasil diperbarui!'); })
                .catch(error => alert('Gagal memperbarui: ' + error.message));
        });
    } else { // Mode Tambah Baru
        const channelRef = database.ref(`playlist/${categoryId}/channels`);
        channelRef.once('value', (snapshot) => {
            channelData.order = snapshot.numChildren() + 1;
            channelRef.push(channelData)
                .then(() => { channelModal.style.display = 'none'; alert('Channel baru berhasil ditambahkan!'); })
                .catch(error => alert('Gagal menambahkan: ' + error.message));
        });
    }
}

function deleteChannel(categoryId, channelId) {
    database.ref(`playlist/${categoryId}/channels/${channelId}`).remove()
        .then(() => alert('Channel berhasil dihapus.'))
        .catch(error => alert('Gagal menghapus channel: ' + error.message));
}

// FUNGSI BARU UNTUK MENGATUR URUTAN CHANNEL
function moveChannel(categoryId, channelId, direction) {
    const categoryRef = database.ref(`playlist/${categoryId}/channels`);
    categoryRef.once('value', (snapshot) => {
        if (!snapshot.exists()) return;

        // Ambil semua channel dan urutkan berdasarkan order
        let channels = [];
        snapshot.forEach((childSnapshot) => {
            channels.push({
                id: childSnapshot.key,
                data: childSnapshot.val()
            });
        });
        channels.sort((a, b) => (a.data.order || 0) - (b.data.order || 0));

        const currentIndex = channels.findIndex(c => c.id === channelId);
        if (currentIndex === -1) {
            console.error("Channel tidak ditemukan.");
            return;
        }

        let newIndex = (direction === 'up') ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= channels.length) {
            console.log("Tidak bisa memindahkan channel lebih jauh.");
            return;
        }

        const currentChannel = channels[currentIndex];
        const targetChannel = channels[newIndex];

        // Tukar nilai 'order'
        const currentOrder = currentChannel.data.order;
        const targetOrder = targetChannel.data.order;

        if (currentOrder === undefined || targetOrder === undefined) {
             console.error("Order tidak terdefinisi, tidak bisa menukar.");
             return;
        }

        // Lakukan update ke database
        const updates = {};
        updates[`/playlist/${categoryId}/channels/${currentChannel.id}/order`] = targetOrder;
        updates[`/playlist/${categoryId}/channels/${targetChannel.id}/order`] = currentOrder;

        database.ref().update(updates)
            .then(() => console.log("Urutan channel berhasil diperbarui."))
            .catch(error => console.error("Gagal memperbarui urutan channel:", error));
    });
}


function loadRemoteConfigInfo() {
    const configContainer = document.getElementById('config-info');
    configContainer.innerHTML = `<p>Memuat konfigurasi...</p>`;
    remoteConfig.fetchAndActivate()
        .then(() => {
            const appConfigVal = remoteConfig.getValue("app_config");
            const configData = JSON.parse(appConfigVal.asString());
            configContainer.innerHTML = `<p><strong>Version Code Aktif:</strong> <code>${configData.versionCode}</code></p><p><strong>URL Playlist Aktif:</strong> <code>${configData.playlistUrl}</code></p><p><strong>URL APK Aktif:</strong> <code>${configData.apkUrl}</code></p>`;
        })
        .catch((error) => {
            console.error("Gagal mengambil Remote Config:", error);
            configContainer.innerHTML = '<p style="color:red;">Gagal memuat konfigurasi.</p>';
        });
}

function loadPendingRequests() {
    const requestsRef = database.ref('pending_requests');
    requestsRef.on('value', (snapshot) => {
        pendingListContainer.innerHTML = '';
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const deviceId = childSnapshot.key;
                const requestData = childSnapshot.val();
                const requestDate = new Date(requestData.timestamp).toLocaleString('id-ID');
                const item = document.createElement('div');
                item.className = 'request-item';
                item.innerHTML = `<p><strong>Device ID:</strong> <code>${deviceId}</code></p><p><strong>Tanggal Minta:</strong> ${requestDate}</p><div class="actions"><input type="text" id="name-${deviceId}" placeholder="Nama Pengguna" required><input type="text" id="key-${deviceId}" placeholder="Kunci Rahasia (keyFragment)" required><input type="number" id="duration-${deviceId}" value="30" style="width: 60px;"><select id="unit-${deviceId}"><option value="minutes">Menit</option><option value="hours">Jam</option><option value="days" selected>Hari</option></select><button class="approve-btn" data-device-id="${deviceId}">Approve</button><button class="reject-btn" data-device-id="${deviceId}">Reject</button></div>`;
                pendingListContainer.appendChild(item);
            });
        } else {
            pendingListContainer.innerHTML = '<p>Tidak ada permintaan tertunda.</p>';
        }
    });
}

function loadActiveDevices() {
    const activeRef = database.ref('verified_devices').orderByChild('expiresAt').startAt(Date.now());
    activeRef.on('value', (snapshot) => {
        activeDevicesContainer.innerHTML = '';
        let hasActiveDevices = false;
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const deviceId = childSnapshot.key;
                const deviceData = childSnapshot.val();
                if (deviceData.isVerified === true) {
                    hasActiveDevices = true;
                    const expiryDate = new Date(deviceData.expiresAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
                    const item = document.createElement('div');
                    item.className = 'request-item';
                    item.innerHTML = `<p><strong>Nama Pengguna:</strong> ${deviceData.userName || 'N/A'}</p><p><strong>Device ID:</strong> <code>${deviceId}</code></p><p><strong>Aktif Sampai:</strong> ${expiryDate}</p><div class="actions"><button class="reject-btn" data-device-id="${deviceId}" data-action="revoke">Cabut Akses</button></div>`;
                    activeDevicesContainer.appendChild(item);
                }
            });
        }
        if (!hasActiveDevices) {
            activeDevicesContainer.innerHTML = '<p>Tidak ada perangkat yang sedang aktif.</p>';
        }
    });
}

function approveRequest(deviceId, userName, keyFragment, duration, unit) {
    let durationMs = 0;
    const durationValue = parseInt(duration);
    if (unit === 'minutes') { durationMs = durationValue * 60 * 1000; }
    else if (unit === 'hours') { durationMs = durationValue * 60 * 60 * 1000; }
    else { durationMs = durationValue * 24 * 60 * 60 * 1000; }
    const expiresAt = Date.now() + durationMs;
    const approvedData = { userName: userName, isVerified: true, expiresAt: expiresAt, keyFragment: keyFragment, approvedAt: Date.now() };
    const updates = {};
    updates[`/verified_devices/${deviceId}`] = approvedData;
    updates[`/pending_requests/${deviceId}`] = null;
    database.ref().update(updates).then(() => alert(`Perangkat ${deviceId} (${userName}) berhasil disetujui!`)).catch(error => alert(`Gagal menyetujui: ${error.message}`));
}

function rejectRequest(deviceId) {
    database.ref(`pending_requests/${deviceId}`).remove().then(() => alert(`Perangkat ${deviceId} berhasil ditolak.`)).catch(error => alert(`Gagal menolak: ${error.message}`));
}

function revokeAccess(deviceId) {
    const updates = { isVerified: false };
    database.ref(`verified_devices/${deviceId}`).update(updates).then(() => alert(`Akses untuk perangkat ${deviceId} berhasil dicabut.`)).catch(error => alert(`Gagal mencabut akses: ${error.message}`));
}
