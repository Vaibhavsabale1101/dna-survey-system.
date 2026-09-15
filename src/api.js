const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error('Backend server is unreachable. Please check your connection.');
  }

  if (!res.ok) {
    let message = `API request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body && body.error) {
        message = body.error;
      }
    } catch {}
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  try {
    return res.status === 204 ? null : await res.json();
  } catch {
    throw new Error('Received an invalid response format from server.');
  }
}

export const api = {
  health: () => request('/health'),

  // Master catalog endpoints
  getVillages: () => request('/villages'),
  getProblems: () => request('/problems'),

  // RESTful survey endpoints
  getSurveysByVillage: (villageCode, formKey) => {
    const query = formKey ? `?formKey=${encodeURIComponent(formKey)}` : '';
    return request(`/surveys/${encodeURIComponent(villageCode)}${query}`);
  },
  createSurvey: (surveyData) => request('/surveys', {
    method: 'POST',
    body: JSON.stringify(surveyData),
  }),
  updateSurvey: (id, surveyData) => request(`/surveys/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(surveyData),
  }),
  deleteSurvey: (id) => request(`/surveys/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),

  // Multipart image upload
  uploadImage: async (formData) => {
    let res;
    try {
      res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
    } catch {
      throw new Error('Image upload failed: Server is unreachable.');
    }

    if (!res.ok) {
      let message = `Upload failed (${res.status})`;
      try {
        const body = await res.json();
        if (body && body.error) message = body.error;
      } catch {}
      throw new Error(message);
    }

    return res.json();
  },

  // Legacy/compatibility endpoints (preserved for existing code & tests)
  listRecords: (formKey) => request(`/forms/${encodeURIComponent(formKey)}`),
  saveRecord: (formKey, record) => request('/surveys', {
    method: 'POST',
    body: JSON.stringify({ ...record, formKey: record.formKey || formKey }),
  }),
  deleteRecord: (formKey, id) => request(`/surveys/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }),
  clearRecords: (formKey) => request(`/forms/${encodeURIComponent(formKey)}`, { method: 'DELETE' }),
  importRecords: (formKey, records) => request(`/forms/${encodeURIComponent(formKey)}/import`, {
    method: 'POST', body: JSON.stringify({ records }),
  }),
  villageBundle: (villageCode) => request(`/villages/${encodeURIComponent(villageCode)}/bundle`),
  villageStatus: (villageCode) => request(`/villages/${encodeURIComponent(villageCode)}/status`),
};

export async function downloadExcel(path, fallbackName = 'DNA_Export.xlsx') {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new Error('Export failed: backend server is unreachable.');
  }
  if (!res.ok) {
    let message = `Export failed (${res.status})`;
    try { const body = await res.json(); if (body?.error) message = body.error; } catch {}
    throw new Error(message);
  }
  const blob = await res.blob();
  const cd = res.headers.get('content-disposition') || '';
  const match = cd.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return filename;
}
