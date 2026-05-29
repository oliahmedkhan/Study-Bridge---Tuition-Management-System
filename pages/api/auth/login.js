import bcrypt from "bcryptjs";
import { generateToken } from "../../../lib/auth";
import { query } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const result = await query("SELECT id, password FROM users WHERE email = $1", [email]);
  const row = result.rows[0];
  if (!row) return res.status(401).json({ error: "Invalid email or password" });

  const passwordMatches = await bcrypt.compare(password, row.password || "");
  if (!passwordMatches) return res.status(401).json({ error: "Invalid email or password" });

  const userRes = await query(
    `SELECT u.id, u.name, u.email, u.role, u.address, u.rating, u.reviews_count, u.is_verified,
            d.name AS district, up.name AS upazila, cl.name AS class_level,
            (SELECT array_agg(s.name) FROM subjects s WHERE s.id = ANY(u.subjects)) AS subjects
     FROM users u
     LEFT JOIN districts d ON u.district_id = d.id
     LEFT JOIN upazilas up ON u.upazila_id = up.id
     LEFT JOIN class_levels cl ON u.class_level_id = cl.id
     WHERE u.id = $1`,
    [row.id],
  );

  const user = userRes.rows[0];
  const token = generateToken({ id: user.id });
  return res.status(200).json({ user, token });
}
