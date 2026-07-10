(function () {
  const STORAGE_KEY = 'weddingResponses';
  const API_URL = (window.WEDDING_RESPONSES_API_URL || 'https://script.google.com/macros/s/AKfycbyi-8YTE9U64XJJUgSOVNi6mMyROZ39v0BcVQzfW0aimYtZIomOQAogEC6Y9aqQTIrEvA/exec').trim();

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
    if (!API_URL) {
      return getLocalResponses();
    }

    try {
      const response = await fetch(API_URL, { method: 'GET' });
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      const responses = Array.isArray(data) ? data : [];
      const normalized = responses.map(normalizeResponse);
      saveLocalResponses(normalized);
      return normalized;
    } catch {
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response)
        });
      } catch {}
    }

    const responses = getLocalResponses();
    responses.push(response);
    saveLocalResponses(responses);
    return responses;
  }

  async function clearResponses() {
    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear' })
        });
      } catch {}
    }

    saveLocalResponses([]);
    return [];
  }

  window.WeddingStorage = { loadResponses, saveResponse, clearResponses };
})();