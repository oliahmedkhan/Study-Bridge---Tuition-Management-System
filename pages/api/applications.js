import { getUserFromToken, verifyToken } from "../../lib/auth";
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
    if (user.role === "student") {
      const result = await query(
        "SELECT a.*, u.name AS tutor_name FROM applications a JOIN users u ON a.tutor_id = u.id WHERE a.student_id = $1 ORDER BY a.created_at DESC",
        [user.id],
      );
      return res.status(200).json({ applications: result.rows });
    }
    const result = await query(
      "SELECT a.*, u.name AS student_name FROM applications a JOIN users u ON a.student_id = u.id WHERE a.tutor_id = $1 ORDER BY a.created_at DESC",
      [user.id],
    );
    return res.status(200).json({ applications: result.rows });
  }

  if (req.method === "POST") {
    if (user.role !== "student") {
      return res.status(403).json({ error: "Only students can send applications." });
    }
    const { tutorId, message } = req.body;
    if (!tutorId || !message) {
      return res.status(400).json({ error: "Missing tutor or message." });
    }
    const tutorResult = await query("SELECT id, name FROM users WHERE id = $1 AND role = 'teacher'", [tutorId]);
    if (!tutorResult.rows.length) {
      return res.status(404).json({ error: "Tutor not found." });
    }
    const tutor = tutorResult.rows[0];
    const subject = "General";
    const insert = await query(
      "INSERT INTO applications (student_id, tutor_id, student_name, tutor_name, subject, message, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *",
      [user.id, tutor.id, user.name, tutor.name, subject, message, "pending"],
    );
    return res.status(201).json({ application: insert.rows[0] });
  }

  if (req.method === "PATCH") {
    if (user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can update applications." });
    }
    const { applicationId, status } = req.body;
    if (!applicationId || !["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid request" });
    }
    const appResult = await query("SELECT tutor_id FROM applications WHERE id = $1", [applicationId]);
    if (!appResult.rows.length || appResult.rows[0].tutor_id !== user.id) {
      return res.status(403).json({ error: "Not authorized to update this application." });
    }
    await query("UPDATE applications SET status = $1 WHERE id = $2", [status, applicationId]);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
