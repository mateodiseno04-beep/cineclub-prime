exports.handler = async (event) => {
  // CONFIGURACIÓN DE SEGURIDAD (CORS)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responder a la verificación del navegador
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }
  
  // ... (el resto del código que ya tenías abajo)

  // Leer credenciales desde variables de entorno (configuradas en Netlify)
  const TOKEN   = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Faltan variables de entorno AIRTABLE_TOKEN y/o AIRTABLE_BASE_ID' })
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const { table, method, id, body } = parsed;

  if (!table) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Falta el campo "table"' }) };
  }

  // Construir URL de Airtable
  let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;
  if (id && (method === 'PATCH' || method === 'DELETE')) {
    url += `/${id}`;
  }

  const fetchOptions = {
    method: method || 'GET',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // Agregar body solo para escritura
  if (body && (method === 'POST' || method === 'PATCH')) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    console.log("MENSAJE DE AIRTABLE:", JSON.stringify(data));
    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al contactar Airtable', detail: err.message }),
    };
  }
};
