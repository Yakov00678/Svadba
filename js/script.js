// ===== ТАЙМЕР ОБРАТНОГО ОТСЧЁТА =====
function updateCountdown() {
    const weddingDate = new Date(2026, 7, 8, 16, 0, 0);
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
        document.getElementById('countdown').innerHTML = '<p style="text-align:center;font-size:1.5rem;color:#667eea;">Свадьба сегодня! 🎉</p>';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

async function saveResponse(name, guests) {
    const attendance = document.getElementById('attendanceToggle')?.checked ? 'yes' : 'no';
    const payload = {
        name,
        guests,
        attendance,
        transport: '',
        drinks: [],
        allergies: '',
        message: 'Нет'
    };

    return window.WeddingStorage?.saveResponse(payload) || [];
}

async function loadResponses() {
    return window.WeddingStorage?.loadResponses ? window.WeddingStorage.loadResponses() : [];
}

// Загружаем при старте
loadResponses();

// ===== ОБРАБОТКА ФОРМЫ =====
document.getElementById('rsvpForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const guests = document.getElementById('guests').value;

    if (!name || !guests) {
        alert('Пожалуйста, заполните имя и количество гостей');
        return;
    }

    const responses = await saveResponse(name, guests);
    
    // Считаем общее число людей во всей базе данных Google
    const totalGuests = responses.reduce((sum, r) => {
        const count = parseInt(r.guests, 10);
        return sum + (isNaN(count) ? 0 : count);
    }, 0);

    alert(`Спасибо, ${name}!\n\n✅ Ваш ответ записан\n👥 Гостей: ${guests}`);

    this.reset();
});

// ===== СКАЧАТЬ В CSV (EXCEL) =====
async function downloadCSV() {
    const responses = await loadResponses();

    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }

    const headers = ['ID', 'Имя', 'Количество гостей', 'Приду', 'Дата'];
    const rows = responses.map(r => [
        r.id,
        r.name,
        r.guests,
        r.attendance === 'yes' ? 'Да' : 'Нет',
        r.date
    ]);

    const totalGuests = responses.reduce((sum, r) => sum + parseInt(r.guests || 0, 10), 0);

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += `Статистика,,,,\n`;
    csvContent += `Подтвердили,${responses.length},,,\n`;
    csvContent += `Всего гостей,${totalGuests},,,\n`;
    csvContent += `,,,,\n`;
    csvContent += headers.join(',') + '\n';

    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `свадьба_ответы_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ Файл сохранён!\nОтветов: ${responses.length}\nГостей: ${totalGuests}`);
}

// ===== СКАЧАТЬ В EXCEL (.xlsx) =====
async function downloadExcel() {
    if (typeof XLSX === 'undefined') {
        alert('⚠️ Библиотека Excel не подключена!');
        return;
    }

    const responses = await loadResponses();

    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }

    const data = [
        ['Статистика', '', '', '', ''],
        ['Подтвердили', responses.length, '', '', ''],
        ['Всего гостей', responses.reduce((sum, r) => sum + parseInt(r.guests || 0, 10), 0), '', '', ''],
        ['', '', '', '', ''],
        ['ID', 'Имя', 'Количество гостей', 'Приду', 'Дата']
    ];

    responses.forEach(r => {
        data.push([
            r.id,
            r.name,
            parseInt(r.guests || 0, 10),
            r.attendance === 'yes' ? 'Да' : 'Нет',
            r.date
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ответы');
    XLSX.writeFile(wb, `свадьба_ответы_${new Date().toISOString().slice(0,10)}.xlsx`);

    alert(`✅ Excel файл сохранён!\nОтветов: ${responses.length}`);
}

// ===== ПОКАЗАТЬ ОТВЕТЫ =====
async function showResponses() {
    const responses = await loadResponses();

    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }

    let message = `═══════════════════════\n`;
    message += `ОТВЕТЫ (${responses.length}):\n`;
    message += `═══════════════════════\n\n`;

    responses.forEach((r, i) => {
        message += `${i + 1}. ${r.name} — ${r.guests} гостя(ей)\n`;
        message += `   ✅ Приду: ${r.attendance === 'yes' ? 'Да' : 'Нет'}\n`;
        message += `\n`;
    });

    alert(message);
}

// ===== ОЧИСТИТЬ ВСЁ =====
async function clearResponses() {
    if (confirm('⚠️ Вы уверены?\nВсе сохранённые ответы будут удалены!')) {
        await window.WeddingStorage?.clearResponses?.();
        alert('✅ Все данные удалены!');
    }
}
