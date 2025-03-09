// public/js/socket.js
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const userId = '<%= session.user ? session.user._id : "" %>'; // Lấy từ session trong header

    if (userId) {
        socket.emit('join', userId);
    }

    // Xử lý thông báo toàn cục
    socket.on('notification', (data) => {
        console.log('Received notification:', data);
        const modal = document.getElementById('notificationModal');
        const title = document.getElementById('notificationTitle');
        const message = document.getElementById('notificationMessage');
        const time = document.getElementById('notificationTime');
        const closeBtn = document.getElementsByClassName('close')[0];

        if (modal && title && message && time) {
            title.textContent = data.title || 'Thông báo mới';
            message.textContent = data.message;
            time.textContent = new Date(data.createdAt).toLocaleString();
            modal.style.display = 'block';

            setTimeout(() => {
                modal.style.display = 'none';
            }, 5000);

            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };

            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }

        const notificationList = document.querySelector('.notification-list');
        const notificationCount = document.querySelector('.notification-count');
        if (notificationList && notificationCount) {
            const newNotification = document.createElement('div');
            newNotification.className = 'notification-item';
            newNotification.innerHTML = `
                <h3>${data.title || 'Thông báo mới'}</h3>
                <p>${data.message}</p>
                <small>${new Date(data.createdAt).toLocaleString()}</small>
            `;
            notificationList.insertBefore(newNotification, notificationList.firstChild);

            let count = parseInt(notificationCount.textContent) || 0;
            count += 1;
            notificationCount.textContent = count;
            notificationCount.style.display = 'block';
        }
    });

    // Lưu socket vào window để tái sử dụng ở các trang khác
    window.appSocket = socket;
});