import { query } from "../../lib/db";

const FALLBACK_TUTORS = [
  {
    id: 1,
    name: "Md. Rafiqul Islam",
    subjects: ["Math", "Physics", "Higher Math"],
    district: "Nilphamari",
    upazila: "Saidpur",
    address: "BAUST Campus, Saidpur",
    rating: 4.8,
    reviews_count: 23,
    is_verified: true,
    color: "#4f8eff",
    bio: "MSc in Applied Math from Dhaka University. 6 years of tutoring experience, specializing in SSC and HSC students.",
    class_levels: "Class 9–12, HSC",
  },
  {
    id: 2,
    name: "Fatema Akter",
    subjects: ["English", "Bangla", "Social Studies"],
    district: "Nilphamari",
    upazila: "Nilphamari Sadar",
    address: "Nilphamari Town, Station Road",
    rating: 4.9,
    reviews_count: 41,
    is_verified: true,
    color: "#7c3aed",
    bio: "BA Honours in English Literature. 5 years of experience teaching primary and secondary students.",
    class_levels: "Class 6–10",
  },
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, subject, district, upazila } = req.query;
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
    const reviews = [];
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
    filters.push(`EXISTS (SELECT 1 FROM subjects s WHERE s.id = ANY(u.subjects) AND s.name = $${index})`);
    values.push(subject);
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
  const tutors = result.rows.length ? result.rows : FALLBACK_TUTORS;
  return res.status(200).json({ tutors });
}
