import bcrypt from "bcryptjs";
import { generateToken } from "../../../lib/auth";
import { query } from "../../../lib/db";

const SALT_ROUNDS = 10;

async function getDistrictId(name) {
  if (!name) return null;
  const r = await query("SELECT id FROM districts WHERE name = $1", [name]);
  if (r.rows[0]) return r.rows[0].id;
  const ins = await query("INSERT INTO districts (name) VALUES ($1) RETURNING id", [name]);
  return ins.rows[0].id;
}

async function getUpazilaId(name, districtId) {
  if (!name || !districtId) return null;
  const r = await query("SELECT id FROM upazilas WHERE name = $1 AND district_id = $2", [name, districtId]);
  if (r.rows[0]) return r.rows[0].id;
  const ins = await query("INSERT INTO upazilas (name, district_id) VALUES ($1, $2) RETURNING id", [name, districtId]);
  return ins.rows[0].id;
}

async function getClassLevelId(name) {
  if (!name) return null;
  const r = await query("SELECT id FROM class_levels WHERE name = $1", [name]);
  return r.rows[0] ? r.rows[0].id : null;
}

async function getSubjectIdsFromNames(names) {
  if (!names || !names.length) return [];
  const ids = [];
  for (const n of names) {
    const name = n.trim();
    if (!name) continue;
    const r = await query("SELECT id FROM subjects WHERE name = $1", [name]);
    if (r.rows[0]) ids.push(r.rows[0].id);
    else {
      const ins = await query("INSERT INTO subjects (name) VALUES ($1) RETURNING id", [name]);
      ids.push(ins.rows[0].id);
    }
  }
  return ids;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, email, password, address, role, class_level, district, upazila, subjects } = req.body;
  const validRoles = ["student", "teacher"];
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim();
  const trimmedPassword = password?.trim();

  if (!trimmedName || !trimmedEmail || !trimmedPassword || !role || !validRoles.includes(role)) {
    return res.status(400).json({ error: "Missing required fields or invalid role" });
  }
  if (trimmedName.length < 3) {
    return res.status(400).json({ error: "Please enter a full name with at least 3 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (trimmedPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }
  if (role === "student" && !class_level) {
    return res.status(400).json({ error: "Please choose your class level." });
  }
  if (role === "teacher") {
    if (!subjects || !subjects.toString().trim()) {
      return res.status(400).json({ error: "Please list at least one subject you teach." });
    }
    if (!district || !upazila) {
      return res.status(400).json({ error: "Please select your district and upazila." });
    }
  }

  const existing = await query("SELECT id FROM users WHERE email = $1", [trimmedEmail]);
  if (existing.rows.length) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const hashedPassword = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);

  const districtId = await getDistrictId(district || null);
  const classLevelId = await getClassLevelId(class_level || null);
  const upazilaId = await getUpazilaId(upazila || null, districtId);
  const subjectNames = typeof subjects === "string" ? subjects.split(",") : Array.isArray(subjects) ? subjects : [];
  const subjectIds = await getSubjectIdsFromNames(subjectNames);

  const result = await query(
    `INSERT INTO users (name, phone, email, password, role, address, class_level_id, district_id, upazila_id, subjects, is_verified, rating, reviews_count, bio)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING id`,
    [
      trimmedName,
      phone || "",
      trimmedEmail,
      hashedPassword,
      role,
      address || "",
      classLevelId,
      districtId,
      upazilaId,
      subjectIds.length ? subjectIds : null,
      role === "teacher" ? false : null,
      role === "teacher" ? 4.0 : null,
      role === "teacher" ? 0 : null,
      role === "teacher" ? "Newly registered tutor on Study Bridge." : null,
    ],
  );

  const userId = result.rows[0].id;

  const userRes = await query(
    `SELECT u.id, u.name, u.email, u.role, u.address, u.rating, u.reviews_count, u.is_verified,
            d.name AS district, up.name AS upazila, cl.name AS class_level,
            (SELECT array_agg(s.name) FROM subjects s WHERE s.id = ANY(u.subjects)) AS subjects
     FROM users u
     LEFT JOIN districts d ON u.district_id = d.id
     LEFT JOIN upazilas up ON u.upazila_id = up.id
     LEFT JOIN class_levels cl ON u.class_level_id = cl.id
     WHERE u.id = $1`,
    [userId],
  );

  const user = userRes.rows[0];
  const token = generateToken({ id: userId });
  return res.status(201).json({ user, token });
}
