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

// ===== СОХРАНЕНИЕ ДАННЫХ =====
function saveResponse(name, guests) {
    const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
    
    const newResponse = {
        id: Date.now(),
        name: name,
        guests: guests,
        date: new Date().toLocaleString('ru-RU')
    };
    
    responses.push(newResponse);
    localStorage.setItem('weddingResponses', JSON.stringify(responses));
    
    return responses;
}

// ===== ЗАГРУЗКА ОТВЕТОВ =====
function loadResponses() {
    return JSON.parse(localStorage.getItem('weddingResponses') || '[]');
}

// Загружаем при старте
loadResponses();

// ===== ОБРАБОТКА ФОРМЫ =====
document.getElementById('rsvpForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const guests = document.getElementById('guests').value;

    if (!name || !guests) {
        alert('Пожалуйста, заполните имя и количество гостей');
        return;
    }

    saveResponse(name, guests);

    const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
    const totalGuests = responses.reduce((sum, r) => sum + parseInt(r.guests || 0, 10), 0);

    alert(`Спасибо, ${name}!\n\n✅ Ваш ответ записан\n👥 Гостей: ${guests}\n\n📊 Всего гостей: ${totalGuests}`);

    this.reset();
});

// ===== СКАЧАТЬ В CSV (EXCEL) =====
function downloadCSV() {
    const responses = loadResponses();
    
    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }
    
    // Заголовки таблицы
    const headers = ['ID', 'Имя', 'Количество гостей', 'Комментарий', 'Дата'];
    
    // Данные для строк
    const rows = responses.map(r => [
        r.id,
        r.name,
        r.guests,
        `"${r.message.replace(/"/g, '""')}"`, // Экранируем кавычки
        r.date
    ]);
    
    // Считаем статистику
    const totalGuests = responses.reduce((sum, r) => sum + parseInt(r.guests), 0);
    
    // Формируем содержимое CSV
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'; // \uFEFF для корректной кодировки в Excel
    
    // Статистика в начале
    csvContent += `Статистика,,,,\n`;
    csvContent += `Подтвердили,${responses.length},,,\n`;
    csvContent += `Всего гостей,${totalGuests},,,\n`;
    csvContent += `,,,,\n`;
    
    // Заголовки
    csvContent += headers.join(',') + '\n';
    
    // Строки с данными
    rows.forEach(row => {
        csvContent += row.join(',') + '\n';
    });
    
    // Создаём ссылку для скачивания
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `свадьба_ответы_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    // Кликаем по ссылке
    link.click();
    
    // Удаляем ссылку
    document.body.removeChild(link);
    
    alert(`✅ Файл сохранён!\nОтветов: ${responses.length}\nГостей: ${totalGuests}`);
}

// ===== СКАЧАТЬ В EXCEL (.xlsx) С БИБЛИОТЕКОЙ =====
function downloadExcel() {
    // Проверяем, подключена ли библиотека SheetJS
    if (typeof XLSX === 'undefined') {
        alert('⚠️ Библиотека Excel не подключена!\n\nСкачайте файл "Способ 2" или используйте CSV.');
        return;
    }
    
    const responses = loadResponses();
    
    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }
    
    // Подготавливаем данные
    const data = [
        ['Статистика', '', '', '', ''],
        ['Подтвердили', responses.length, '', '', ''],
        ['Всего гостей', responses.reduce((sum, r) => sum + parseInt(r.guests), 0), '', '', ''],
        ['', '', '', '', ''],
        ['ID', 'Имя', 'Количество гостей', 'Комментарий', 'Дата']
    ];
    
    // Добавляем ответы
    responses.forEach(r => {
        data.push([
            r.id,
            r.name,
            parseInt(r.guests),
            r.message,
            r.date
        ]);
    });
    
    // Создаём книгу Excel
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ответы');
    
    // Скачиваем файл
    XLSX.writeFile(wb, `свадьба_ответы_${new Date().toISOString().slice(0,10)}.xlsx`);
    
    alert(`✅ Excel файл сохранён!\nОтветов: ${responses.length}\nГостей: ${data[2][1]}`);
}

// ===== ПОКАЗАТЬ ОТВЕТЫ =====
function showResponses() {
    const responses = loadResponses();
    
    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }
    
    let message = `═══════════════════════\n`;
    message += `ОТВЕТЫ (${responses.length}):\n`;
    message += `═══════════════════════\n\n`;
    
    responses.forEach((r, i) => {
        message += `${i + 1}. ${r.name} — ${r.guests} гостя(ей)\n`;
        if (r.message !== 'Нет') {
            message += `   💬 ${r.message}\n`;
        }
        message += `\n`;
    });
    
    alert(message);
}

// ===== ОЧИСТИТЬ ВСЁ =====
function clearResponses() {
    if (confirm('⚠️ Вы уверены?\nВсе сохранённые ответы будут удалены!')) {
        localStorage.removeItem('weddingResponses');
        alert('✅ Все данные удалены!');
    }
}