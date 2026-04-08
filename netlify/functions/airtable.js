const https = require('https');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const { table, method, id, body } = JSON.parse(event.body);
        const TOKEN = process.env.AIRTABLE_TOKEN;
        const BASE_ID = process.env.AIRTABLE_BASE_ID;

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
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers,
                        body: data
                    });
                });
            });

            req.on('error', (e) => reject({ statusCode: 500, headers, body: e.message }));
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    } catch (err) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
};
