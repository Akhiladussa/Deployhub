const { Client } = require('pg');

const getDbClient = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
};

exports.handler = async (event) => {
  let client;
  try {
    const tenantId = event.requestContext?.authorizer?.claims['custom:tenant_id'];

    if (!tenantId) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized — no tenant ID' })
      };
    }

    client = await getDbClient();

    const result = await client.query(
      `SELECT * FROM tasks
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId]
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: result.rows,
        count: result.rowCount,
        tenant_id: tenantId
      })
    };

  } catch (error) {
    console.error('get-tasks error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    if (client) await client.end();
  }
};