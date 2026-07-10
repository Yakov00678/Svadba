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

  function mergeResponses(remoteResponses, localResponses) {
    const map = new Map();
    const all = [...remoteResponses, ...localResponses];

    all.forEach((item) => {
      const normalized = normalizeResponse(item);
      const key = normalized.id || `${normalized.name}|${normalized.guests}|${normalized.attendance}|${normalized.date}`;
      if (!map.has(key)) {
        map.set(key, normalized);
      }
    });

    return Array.from(map.values());
  }

  async function loadResponses() {
    const localResponses = getLocalResponses();

    if (!API_URL) {
      return localResponses;
    }

    try {
      const response = await fetch(API_URL, { method: 'GET' });
      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      const remoteResponses = Array.isArray(data) ? data : [];
      const merged = mergeResponses(remoteResponses.map(normalizeResponse), localResponses);

      saveLocalResponses(merged);
      return merged;
    } catch (error) {
      console.error('Ошибка загрузки из Google:', error);
      return localResponses;
    }
  }

  async function saveResponse(payload) {
    const response = normalizeResponse({
      ...payload,
      id: Date.now(),
      date: new Date().toLocaleString('ru-RU')
    });

    const localResponses = getLocalResponses();
    localResponses.push(response);
    saveLocalResponses(localResponses);

    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response)
        });

        return await loadResponses();
      } catch (error) {
        console.error('Ошибка отправки в Google:', error);
        return localResponses;
      }
    }

    return localResponses;
  }

  async function clearResponses() {
    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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