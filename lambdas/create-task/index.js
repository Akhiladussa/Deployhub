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
    console.log("EVENT:", JSON.stringify(event));

    // Parse body safely
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : (event.body || event);

    const { title, description, status } = body;

    // Read tenant id
    const tenantId =
      event.requestContext?.authorizer?.claims?.["custom:tenant_id"];

    if (!tenantId) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Unauthorized — no tenant ID"
        })
      };
    }

    if (!title) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "title is required"
        })
      };
    }

    client = await getDbClient();

    const result = await client.query(
      `
      INSERT INTO tasks
      (tenant_id, title, description, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        tenantId,
        title,
        description || null,
        status || "pending"
      ]
    );

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(result.rows[0])
    };

  } catch (error) {
    console.error("create-task error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: error.message
      })
    };

  } finally {
    if (client) {
      await client.end();
    }
  }
};

