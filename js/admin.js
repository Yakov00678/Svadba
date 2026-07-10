// ===== ПАРОЛЬ (измените на свой!) =====
const ADMIN_PASSWORD = 'Rewqazxcv'; // ← ЗДЕСЬ ВАШ ПАРОЛЬ

// ===== ПРОВЕРКА ПАРОЛЯ =====
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    if (password === ADMIN_PASSWORD) {
        // Пароль верный — показываем админ-панель
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        
        // Загружаем данные
        loadAdminData();
    } else {
        // Пароль неверный
        errorMessage.textContent = '❌ Неверный пароль! Попробуйте ещё раз.';
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
});

// ===== ВЫХОД ИЗ АДМИНКИ =====
function logout() {
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('password').value = '';
    document.getElementById('errorMessage').textContent = '';
}

// ===== ЗАГРУЗКА ДАННЫХ =====
function loadAdminData() {
    const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
    
    // Обновляем статистику
    const confirmedCount = responses.filter(r => r.attendance === 'yes').length;
    document.getElementById('confirmedCount').textContent = confirmedCount;
    document.getElementById('responsesCount').textContent = responses.length;

    const totalGuests = responses.reduce((sum, r) => sum + parseInt(r.guests || 0, 10), 0);
    document.getElementById('totalGuests').textContent = totalGuests;
    
    // Заполняем таблицу
    fillTable(responses);
}

// ===== ЗАПОЛНЕНИЕ ТАБЛИЦЫ =====
function fillTable(responses) {
    const tableBody = document.getElementById('tableBody');
    
    if (responses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
                    📭 Нет сохранённых ответов
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = responses.map((r, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${r.name}</strong></td>
            <td>${r.guests}</td>
            <td>${r.attendance === 'yes' ? 'Приду' : (r.attendance === 'no' ? 'Не приду' : '—')}</td>
            <td>${r.transport === 'yes' ? 'Да' : (r.transport === 'no' ? 'Нет' : '—')}</td>
            <td>${Array.isArray(r.drinks) && r.drinks.length ? r.drinks.join(', ') : '—'}</td>
            <td>${r.allergies && r.allergies.trim() ? r.allergies : '—'}</td>
            <td>${r.message === 'Нет' ? '—' : r.message}</td>
            <td>${r.date}</td>
        </tr>
    `).join('');
}

// ===== СКАЧАТЬ CSV =====
function downloadCSV() {
    const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
    
    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }
    
    const headers = ['ID', 'Имя', 'Количество гостей', 'Приду', 'Транспорт', 'Предпочтения', 'Аллергии', 'Комментарий', 'Дата'];
    const rows = responses.map(r => [
        r.id,
        r.name,
        r.guests,
        r.attendance === 'yes' ? 'Приду' : (r.attendance === 'no' ? 'Не приду' : ''),
        r.transport === 'yes' ? 'Да' : (r.transport === 'no' ? 'Нет' : ''),
        Array.isArray(r.drinks) && r.drinks.length ? `"${r.drinks.join('; ')}"` : '',
        `"${(r.allergies || '').replace(/"/g, '""')}"`,
        `"${(r.message || '').replace(/"/g, '""')}"`,
        r.date
    ]);
    
    const totalGuests = responses.reduce((sum, r) => sum + parseInt(r.guests), 0);
    
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
    
    alert(`✅ CSV файл сохранён!\nОтветов: ${responses.length}\nГостей: ${totalGuests}`);
}

// ===== СКАЧАТЬ EXCEL (.xlsx) =====
function downloadExcel() {
    const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
    
    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }
    
    const data = [
        ['Статистика', '', '', '', '', '', '', '', ''],
        ['Подтвердили', responses.filter(r => r.attendance === 'yes').length, '', '', '', '', '', '', ''],
        ['Всего гостей', responses.reduce((sum, r) => sum + (r.attendance === 'yes' ? parseInt(r.guests || 0) : 0), 0), '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ''],
        ['ID', 'Имя', 'Количество гостей', 'Приду', 'Транспорт', 'Предпочтения', 'Аллергии', 'Комментарий', 'Дата']
    ];

    responses.forEach(r => {
        data.push([
            r.id,
            r.name,
            parseInt(r.guests) || 0,
            r.attendance === 'yes' ? 'Приду' : (r.attendance === 'no' ? 'Не приду' : ''),
            r.transport === 'yes' ? 'Да' : (r.transport === 'no' ? 'Нет' : ''),
            Array.isArray(r.drinks) && r.drinks.length ? r.drinks.join('; ') : '',
            r.allergies || '',
            r.message || '',
            r.date
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ответы');
    XLSX.writeFile(wb, `свадьба_ответы_${new Date().toISOString().slice(0,10)}.xlsx`);
    
    alert(`✅ Excel файл сохранён!\nОтветов: ${responses.length}\nГостей: ${data[2][1]}`);
}

// ===== СКАЧАТЬ JSON =====
function downloadJSON() {
    const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
    
    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }
    
    const data = {
        statistics: {
            confirmed: responses.filter(r => r.attendance === 'yes').length,
            totalGuests: responses.reduce((sum, r) => sum + (r.attendance === 'yes' ? parseInt(r.guests || 0) : 0), 0)
        },
        responses: responses
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `свадьба_ответы_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`✅ JSON файл сохранён!\nОтветов: ${responses.length}`);
}

// ===== СКАЧАТЬ TXT =====
function downloadTXT() {
    const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
    
    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }
    
    let content = `═══════════════════════════════════\n`;
    content += `   ОТВЕТЫ НА ПРИГЛАШЕНИЕ\n`;
    content += `   Свадьба: Анна & Алексей\n`;
    content += `   Дата: 15 июня 2026 года\n`;
    content += `═══════════════════════════════════\n\n`;
    
    const totalGuests = responses.reduce((sum, r) => sum + (r.attendance === 'yes' ? parseInt(r.guests || 0) : 0), 0);
    content += `Статистика:\n`;
    content += `• Подтвердили: ${responses.length} человек(а)\n`;
    content += `• Всего гостей: ${totalGuests}\n\n`;
    content += `═══════════════════════════════════\n\n`;
    
    responses.forEach((response, index) => {
        content += `Ответ #${index + 1}\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        content += `👤 Имя: ${response.name}\n`;
        content += `👥 Гостей: ${response.guests}\n`;
        content += `✅ Приду: ${response.attendance === 'yes' ? 'Да' : (response.attendance === 'no' ? 'Нет' : '—')}\n`;
        content += `🚗 Транспорт: ${response.transport === 'yes' ? 'Да' : (response.transport === 'no' ? 'Нет' : '—')}\n`;
        content += `⚠️ Аллергии: ${response.allergies || 'Нет'}\n`;
        content += `📝 Комментарий: ${response.message || 'Нет'}\n`;
        content += `📅 Дата: ${response.date}\n`;
        content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `свадьба_ответы_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`✅ TXT файл сохранён!\nОтветов: ${responses.length}\nГостей: ${totalGuests}`);
}

// ===== ПОКАЗАТЬ ПОДРОБНЕЕ =====
function showResponses() {
    const responses = JSON.parse(localStorage.getItem('weddingResponses') || '[]');
    
    if (responses.length === 0) {
        alert('Нет сохранённых ответов!');
        return;
    }
    
    let message = `═══════════════════════\n`;
    message += `ОТВЕТЫ (${responses.length}):\n`;
    message += `═══════════════════════\n\n`;
    
    responses.forEach((r, i) => {
        message += `${i + 1}. ${r.name} — ${r.guests} гостя(ей)\n`;
        message += `   ✅ Приду: ${r.attendance === 'yes' ? 'Да' : (r.attendance === 'no' ? 'Нет' : '—')}\n`;
        message += `   🚗 Транспорт: ${r.transport === 'yes' ? 'Да' : (r.transport === 'no' ? 'Нет' : '—')}\n`;
        if (r.allergies && r.allergies.trim()) {
            message += `   ⚠️ Аллергии: ${r.allergies}\n`;
        }
        if (r.message && r.message !== 'Нет') {
            message += `   💬 ${r.message}\n`;
        }
        message += `\n`;
    });
    
    alert(message);
}

// ===== ОЧИСТИТЬ ВСЁ =====
function clearResponses() {
    if (confirm('⚠️ Вы уверены?\nВсе сохранённые ответы будут удалены безвозвратно!')) {
        localStorage.removeItem('weddingResponses');
        alert('✅ Все данные удалены!');
        // Обновляем интерфейс
        loadAdminData();
    }
}

// ===== ЗАГРУЗКА ПРИ СТАРТЕ =====
// Если пароль уже введён ранее (можно добавить сохранение сессии)