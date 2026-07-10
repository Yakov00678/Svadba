(function () {
  const API_URL = (window.WEDDING_RESPONSES_API_URL || 'https://script.google.com/macros/s/AKfycbyGA_alBHdHPPa8MON4zTzCjq2FSHqntHcgy2hj6WjX0cL52Edg0yh1WV4p9ywV8qcD/exec').trim();

  function normalizeResponse(item = {}) {
    return {
      id: item.id || Date.now(),
      name: item.name || '',
      guests: item.guests || '',
      attendance: item.attendance || '',
      transport: item.transport || '',
      drinks: Array.isArray(item.drinks) ? item.drinks : [],
      allergies: item.allergies || '',
      message: item.message || '',
      date: item.date || new Date().toLocaleString('ru-RU')
    };
  }

  // ЗАГРУЗКА: Теперь строго из Google Таблицы напрямую
  async function loadResponses() {
    if (!API_URL) return [];

    try {
      // КРИТИЧЕСКИ ВАЖНО: redirect: 'follow' заставляет браузер пройти по ссылке Google и забрать данные
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow', 
        cache: 'no-store'
      });
      
      if (!response.ok) throw new Error('Network error');

      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      
      return (Array.isArray(data) ? data : []).map(normalizeResponse);
    } catch (error) {
      console.error('Ошибка загрузки из Google:', error);
      return [];
    }
  }

  // ОТПРАВКА: Прямой POST-запрос в таблицу
  async function saveResponse(payload) {
    const response = normalizeResponse({
      ...payload,
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU')
    });

    if (API_URL) {
      try {
        const fetchResult = await fetch(API_URL, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(response)
        });

        if (!fetchResult.ok) throw new Error('Google error');
        return await loadResponses(); // Сразу возвращаем свежую базу из Google
      } catch (error) {
        console.error('Ошибка отправки в Google:', error);
      }
    }
    return []; 
  }

  async function clearResponses() {
    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({ action: 'clear' })
        });
      } catch (error) {
        console.error('Ошибка очистки в Google:', error);
      }
    }
    return [];
  }

  window.WeddingStorage = { loadResponses, saveResponse, clearResponses };
})();
