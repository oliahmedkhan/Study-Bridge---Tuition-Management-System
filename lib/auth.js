import jwt from "jsonwebtoken";
import { query } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token) {
  const payload = verifyToken(token);
  if (!payload?.id) return null;
  const res = await query(
    `SELECT u.id, u.name, u.email, u.role, u.address, u.rating, u.reviews_count, u.is_verified,
            d.name AS district, up.name AS upazila, cl.name AS class_level,
            (SELECT array_agg(s.name) FROM subjects s WHERE s.id = ANY(u.subjects)) AS subjects
     FROM users u
     LEFT JOIN districts d ON u.district_id = d.id
     LEFT JOIN upazilas up ON u.upazila_id = up.id
     LEFT JOIN class_levels cl ON u.class_level_id = cl.id
     WHERE u.id = $1`,
    [payload.id],
  );
  return res.rows[0] || null;
}
