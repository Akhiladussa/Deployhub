const { Client } = require('pg');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const secretsClient = new SecretsManagerClient({ region: 'ap-south-1' });
let cachedSecret = null;

const getSecret = async () => {
  if (cachedSecret) return cachedSecret;
  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: 'deployhub/db-credentials'
    })
  );
  cachedSecret = JSON.parse(response.SecretString);
  return cachedSecret;
};

const getDbClient = async () => {
  const secret = await getSecret();
  const client = new Client({
    host: secret.host,
    user: secret.username,
    password: secret.password,
    database: secret.dbname,
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  return client;
};

exports.handler = async (event) => {
  let client;
  try {
    let tenantId;
    try {
      const authHeader = event.headers?.Authorization ||
                        event.headers?.authorization || '';
      const token = authHeader.replace('Bearer ', '').trim();
      if (token) {
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString()
        );
        tenantId = payload['custom:tenant_id'];
      }
    } catch(e) {
      tenantId = null;
    }

    if (!tenantId) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized — no tenant ID' })
      };
    }

    const taskId = event.pathParameters?.id;
    if (!taskId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'task id is required in path' })
      };
    }

    client = await getDbClient();

    const result = await client.query(
      `DELETE FROM tasks
       WHERE task_id = $1
         AND tenant_id = $2
       RETURNING task_id, title`,
      [taskId, tenantId]
    );

    if (result.rowCount === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Task not found or not yours' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Task deleted successfully',
        deleted: result.rows[0]
      })
    };

  } catch (error) {
    console.error('delete-task error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    if (client) await client.end();
  }
};
