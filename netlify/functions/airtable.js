const https = require('https');

exports.handler = async (event) => {
    // Configuración de seguridad para que el navegador no bloquee la conexión
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Responder a la verificación del navegador
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const parsedBody = JSON.parse(event.body || '{}');
        const { table, method, id, body } = parsedBody;
        
        const TOKEN = process.env.AIRTABLE_TOKEN;
        const BASE_ID = process.env.AIRTABLE_BASE_ID;

        // Construcción de la ruta hacia Airtable
        const path = `/v0/${BASE_ID}/${table}${id ? `/${id}` : ''}`;
        
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.airtable.com',
                path: path,
                method: method || 'GET',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => responseData += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers,
                        body: responseData
                    });
                });
            });

            req.on('error', (e) => {
                resolve({ 
                    statusCode: 500, 
                    headers, 
                    body: JSON.stringify({ error: 'Error de red', detail: e.message }) 
                });
            });

            if (body) {
                req.write(JSON.stringify(body));
            }
            req.end();
        });

    } catch (err) {
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: 'Error interno', detail: err.message }) 
        };
    }
};
