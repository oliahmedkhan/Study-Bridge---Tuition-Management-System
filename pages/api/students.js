import { query } from "../../lib/db";

const FALLBACK_STUDENTS = [];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, district, upazila, class_level } = req.query;
  if (id) {
    const result = await query(
      `SELECT u.id, u.name, cl.name AS class_level, d.name AS district, up.name AS upazila, u.address, u.rating, u.reviews_count, u.is_verified
       FROM users u
       LEFT JOIN districts d ON u.district_id = d.id
       LEFT JOIN upazilas up ON u.upazila_id = up.id
       LEFT JOIN class_levels cl ON u.class_level_id = cl.id
       WHERE u.id = $1 AND u.role = 'student'`,
      [id],
    );
    const student = result.rows[0];
    if (!student) return res.status(404).json({ error: "Student not found" });
    return res.status(200).json({ student });
  }

  const filters = [];
  const values = [];
  let index = 1;
  let queryText = `SELECT u.id, u.name, cl.name AS class_level, d.name AS district, up.name AS upazila, u.address, u.rating, u.reviews_count, u.is_verified
    FROM users u
    LEFT JOIN districts d ON u.district_id = d.id
    LEFT JOIN upazilas up ON u.upazila_id = up.id
    LEFT JOIN class_levels cl ON u.class_level_id = cl.id
    WHERE u.role = 'student'`;

  if (district) {
    filters.push(`d.name = $${index}`);
    values.push(district);
    index += 1;
  }
  if (upazila) {
    filters.push(`up.name = $${index}`);
    values.push(upazila);
    index += 1;
  }
  if (class_level) {
    filters.push(`cl.name = $${index}`);
    values.push(class_level);
    index += 1;
  }
  if (filters.length) {
    queryText += ` AND ${filters.join(" AND ")}`;
  }

  const result = await query(queryText, values);
  const students = result.rows.length ? result.rows : FALLBACK_STUDENTS;
  return res.status(200).json({ students });
}
