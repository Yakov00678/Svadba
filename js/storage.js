(function () {
  const STORAGE_KEY = 'weddingResponses';
  const API_URL = (window.WEDDING_RESPONSES_API_URL || 'https://script.google.com/macros/s/AKfycbyGA_alBHdHPPa8MON4zTzCjq2FSHqntHcgy2hj6WjX0cL52Edg0yh1WV4p9ywV8qcD/exec').trim();

  function getLocalResponses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveLocalResponses(responses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  }

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

  async function loadResponses() {
    if (!API_URL) return getLocalResponses();

    try {
      // Добавляем t=Date.now(), чтобы браузер не кэшировал старый ответ
      const response = await fetch(`${API_URL}?t=${Date.now()}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('Network error');

      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      const remoteResponses = (Array.isArray(data) ? data : []).map(normalizeResponse);

      // Перезаписываем кэш чистыми данными из сети
      saveLocalResponses(remoteResponses);
      return remoteResponses;
    } catch (error) {
      console.error('Ошибка загрузки из Google:', error);
      return getLocalResponses();
    }
  }

  async function saveResponse(payload) {
    const response = normalizeResponse({
      ...payload,
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU')
    });

    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(response)
        });
        // После успешной отправки запрашиваем актуальную базу из Google
        return await loadResponses();
      } catch (error) {
        console.error('Ошибка отправки в Google:', error);
      }
    }

    const localResponses = getLocalResponses();
    localResponses.push(response);
    saveLocalResponses(localResponses);
    return localResponses;
  }

  async function clearResponses() {
    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({ action: 'clear' })
        });
      } catch (error) {
        console.error('Ошибка очистки в Google:', error);
      }
    }
    saveLocalResponses([]);
    return [];
  }

  window.WeddingStorage = { loadResponses, saveResponse, clearResponses };
})();