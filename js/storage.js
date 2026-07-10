(function () {
  const STORAGE_KEY = 'weddingResponses';
  // 1. ОБЯЗАТЕЛЬНО ЗАМЕНИТЕ ССЫЛКУ НИЖЕ НА СВОЮ ИЗ GOOGLE APPS SCRIPT!
  const API_URL = (window.WEDDING_RESPONSES_API_URL || 'https://script.google.com/macros/s/AKfycbwBJ2k0Nl93UhzeGLFPlFCOKIba_jtAZU9-2r8C5Pngg_7-f1lVRdukjTDL943em-fE/exec').trim();

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
    } catch (error) {
      console.error('Ошибка загрузки данных из Google:', error);
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
        // Изменили Content-Type на text/plain для обхода капризов CORS в Google Apps Script
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' }, 
          body: JSON.stringify(response)
        });
      } catch (error) {
        console.error('Ошибка отправки в Google:', error);
      }
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
          headers: { 'Content-Type': 'text/plain' },
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