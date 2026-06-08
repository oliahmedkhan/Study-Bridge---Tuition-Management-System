import { query } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const subject = req.query.subject?.toString().trim();
  const district = req.query.district?.toString().trim();
  const upazila = req.query.upazila?.toString().trim();
  if (id) {
    const result = await query(
      `SELECT u.id, u.name, (SELECT array_agg(s.name) FROM subjects s WHERE s.id = ANY(u.subjects)) AS subjects,
              d.name AS district, up.name AS upazila, u.address, u.rating, u.reviews_count, u.is_verified, u.color, u.bio, cl.name AS class_level
       FROM users u
       LEFT JOIN districts d ON u.district_id = d.id
       LEFT JOIN upazilas up ON u.upazila_id = up.id
       LEFT JOIN class_levels cl ON u.class_level_id = cl.id
       WHERE u.id = $1 AND u.role = 'teacher'`,
      [id],
    );
    const tutor = result.rows[0];
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }
    const reviewResult = await query(
      `SELECT r.id, r.rating, r.comment AS text, u.name AS name, to_char(r.created_at, 'YYYY-MM-DD') AS date
       FROM reviews r
       JOIN users u ON r.student_id = u.id
       WHERE r.tutor_id = $1
       ORDER BY r.created_at DESC`,
      [id],
    );
    const reviews = reviewResult.rows;
    return res.status(200).json({ tutor, reviews });
  }

  const filters = [];
  const values = [];
  let index = 1;
  let queryText = `SELECT u.id, u.name, (SELECT array_agg(s.name) FROM subjects s WHERE s.id = ANY(u.subjects)) AS subjects,
            d.name AS district, up.name AS upazila, u.address, u.rating, u.reviews_count, u.is_verified, u.color, u.bio, cl.name AS class_level
     FROM users u
     LEFT JOIN districts d ON u.district_id = d.id
     LEFT JOIN upazilas up ON u.upazila_id = up.id
     LEFT JOIN class_levels cl ON u.class_level_id = cl.id
     WHERE u.role = 'teacher'`;

  if (subject) {
    filters.push(`EXISTS (SELECT 1 FROM subjects s WHERE s.id = ANY(u.subjects) AND s.name ILIKE $${index})`);
    values.push(`%${subject}%`);
    index += 1;
  }
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
  if (filters.length) {
    queryText += ` AND ${filters.join(" AND ")}`;
  }

  const result = await query(queryText, values);
  return res.status(200).json({ tutors: result.rows });
}
