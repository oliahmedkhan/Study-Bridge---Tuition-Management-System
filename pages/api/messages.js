import { getUserFromToken } from "../../lib/auth";
import { query } from "../../lib/db";

function getBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

export default async function handler(req, res) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (req.method === "GET") {
    const { otherId } = req.query;
    if (!otherId) {
      return res.status(400).json({ error: "Missing otherId" });
    }
    const result = await query(
      `SELECT m.id, m.sender_id, m.recipient_id, m.content, to_char(m.created_at, 'YYYY-MM-DD HH24:MI') AS created_at,
              u.name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2)
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at ASC`,
      [user.id, otherId],
    );
    return res.status(200).json({ messages: result.rows });
  }

  if (req.method === "POST") {
    const { recipientId, content } = req.body;
    if (!recipientId || !content || !content.trim()) {
      return res.status(400).json({ error: "Missing recipient or content" });
    }
    const recipientResult = await query("SELECT id FROM users WHERE id = $1", [recipientId]);
    if (!recipientResult.rows.length) {
      return res.status(404).json({ error: "Recipient not found" });
    }
    await query("INSERT INTO messages (sender_id, recipient_id, content, created_at) VALUES ($1, $2, $3, NOW())", [
      user.id,
      recipientId,
      content.trim(),
    ]);
    return res.status(201).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
