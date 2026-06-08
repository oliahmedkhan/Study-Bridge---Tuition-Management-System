import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";

const subjects = [
  "Mathematics",
  "Higher Math",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Bangla",
  "ICT",
  "Accounting",
  "Economics",
  "Computer Science",
  "Programming",
];
const districts = ["Dhaka", "Chattogram", "Rajshahi", "Rangpur", "Nilphamari", "Lalmonirhat", "Sylhet", "Khulna", "Mymensingh"];
const upazilas = ["Saidpur", "Nilphamari Sadar", "Jaldhaka", "Rangpur Sadar", "Badarganj", "Dimla"];
const classLevels = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10 (SSC)", "Class 11", "Class 12 (HSC)", "University"];

export default function Search() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState("tutors");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: "", class_level: "", district: "", upazila: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const queryMode = router.query.mode;
    if (user?.role === "teacher") {
      setMode("students");
      return;
    }
    if (user?.role === "student") {
      setMode("tutors");
      return;
    }
    if (queryMode === "students" || queryMode === "tutors") {
      setMode(queryMode);
      return;
    }
    setMode("tutors");
  }, [router.isReady, router.query.mode, user]);

  const loadResults = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const query = new URLSearchParams();
      if (filters.district) query.set("district", filters.district);
      if (filters.upazila) query.set("upazila", filters.upazila);
      if (mode === "tutors" && filters.subject) query.set("subject", filters.subject);
      if (mode === "students" && filters.class_level) query.set("class_level", filters.class_level);
      const endpoint = mode === "students" ? "/api/students" : "/api/tutors";
      const res = await fetch(`${endpoint}?${query.toString()}`);
      const body = await res.json();
      setResults(body.tutors || body.students || []);
    } catch (err) {
      setError("Unable to load results. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [mode]);

  useEffect(() => {
    const delay = setTimeout(() => loadResults(false), 300);
    return () => clearTimeout(delay);
  }, [filters, mode]);

  const updateFilter = (field) => (event) => setFilters({ ...filters, [field]: event.target.value });

  const handleFilter = async () => {
    await loadResults();
  };

  const clearFilters = async () => {
    setFilters({ subject: "", class_level: "", district: "", upazila: "" });
    await loadResults();
  };

  const canSearchTutors = !user || user.role === "student";
  const canSearchStudents = user?.role === "teacher";
  const entityLabel = mode === "students" ? "Student" : "Tutor";
  const headline = mode === "students" ? "Find Students" : "Find a Tutor";
  const subline =
    mode === "students"
      ? "Teachers can search for motivated students by class and location."
      : "Students can browse verified tutors by subject and location.";
  const placeholder = mode === "students" ? "Search for motivated learners" : "Search for top tutors";

  return (
    <div>
      <NavBar />
      <div className="search-page">
        <div className="container">
          <div className="search-header">
            <div>
              <h2>{headline}</h2>
              <p>{subline}</p>
            </div>
            <div className="role-toggle" style={{ maxWidth: "420px" }}>
              <button
                className={`role-btn ${mode === "tutors" ? "active" : ""}`}
                disabled={!canSearchTutors}
                onClick={() => canSearchTutors && setMode("tutors")}>
                Find Tutors
              </button>
              <button
                className={`role-btn ${mode === "students" ? "active" : ""}`}
                disabled={!canSearchStudents}
                onClick={() => canSearchStudents && setMode("students")}>
                Find Students
              </button>
            </div>
          </div>
          <div className="match-note">{error || `${placeholder}. Use filters to narrow your search and click any card to view a full profile.`}</div>
          <div className="filter-bar">
            {mode === "tutors" ? (
              <div className="filter-group">
                <label>Subject</label>
                <select className="filter-select" value={filters.subject} onChange={updateFilter("subject")}>
                  <option value="">All subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="filter-group">
                <label>Class / Level</label>
                <select className="filter-select" value={filters.class_level} onChange={updateFilter("class_level")}>
                  <option value="">All class levels</option>
                  {classLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="filter-group">
              <label>District</label>
              <select className="filter-select" value={filters.district} onChange={updateFilter("district")}>
                <option value="">All districts</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Upazila</label>
              <select className="filter-select" value={filters.upazila} onChange={updateFilter("upazila")}>
                <option value="">All upazilas</option>
                {upazilas.map((upazila) => (
                  <option key={upazila} value={upazila}>
                    {upazila}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn-filter" onClick={handleFilter}>
              Search
            </button>
            <button className="btn-clear" onClick={clearFilters}>
              Reset
            </button>
          </div>

          <div className="tutors-grid">
            {loading ? (
              <div className="no-results" style={{ gridColumn: "1/-1" }}>
                <h3>Loading results…</h3>
              </div>
            ) : results.length ? (
              results.map((item) => (
                <div
                  key={item.id}
                  className="tutor-card"
                  onClick={() => router.push(`/profile/${item.id}?type=${mode === "students" ? "student" : "tutor"}`)}>
                  <div className="tutor-card-top">
                    <div className="tutor-avatar" style={{ background: item.color || "#2e7d32" }}>
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="tutor-info">
                      <h3>{item.name}</h3>
                      <p>
                        {item.district}
                        {item.upazila ? ", " + item.upazila : ""}
                      </p>
                      {item.is_verified ? <span className="verified-badge">✓ Verified</span> : null}
                    </div>
                  </div>
                  <div className="subjects-list">
                    {(mode === "tutors" ? item.subjects : [item.class_level]).filter(Boolean).map((label) => (
                      <span key={label} className="subject-tag">
                        {label}
                      </span>
                    ))}
                  </div>
                  <div className="tutor-meta">
                    <div>
                      {mode === "tutors" ? (
                        <>
                          <span style={{ color: "var(--gold)" }}>
                            {"★".repeat(Math.floor(item.rating || 4)) + "☆".repeat(5 - Math.floor(item.rating || 4))}
                          </span>{" "}
                          <span style={{ fontSize: "0.78rem" }}>
                            {parseFloat(item.rating || 4).toFixed(1)} ({item.reviews_count || 0})
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: "0.78rem", color: "var(--text2)" }}>Student profile</span>
                      )}
                    </div>
                    <div className="tutor-location">📍 {item.upazila || item.district}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results" style={{ gridColumn: "1/-1" }}>
                <h3>No {entityLabel.toLowerCase()}s found</h3>
                <p>Try broadening your search or resetting filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
