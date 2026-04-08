// Netlify Function: airtable.js
exports.handler = async (event) => {
  // 1. CONFIGURACIÓN DE SEGURIDAD (CORS)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 2. Responder a la verificación del navegador (Pre-flight)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // 3. Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  // 4. Credenciales desde Netlify
  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Faltan variables de entorno' })
    };
  }

  // 5. Procesar los datos que llegan del sitio
  let parsed;
  try {
    parsed = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const { table, method, id, body } = parsed;

  if (!table) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Falta el campo "table"' }) };
  }

  // 6. Construir URL de Airtable
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

  if (body && (method === 'POST' || method === 'PATCH')) {
    fetchOptions.body = JSON.stringify(body);
  }

  // 7. Llamada real a Airtable
  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    // Log para ver el error real en Netlify si algo falla
    console.log("MENSAJE DE AIRTABLE:", JSON.stringify(data));

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error al contactar Airtable', detail: err.message }),
    };
  }
}; // <--- ESTE ES EL ÚLTIMO CORCHETE QUE CIERRA TODO
