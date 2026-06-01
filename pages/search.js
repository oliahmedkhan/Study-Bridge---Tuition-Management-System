import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";

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

export default function Search() {
  const router = useRouter();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: "", district: "", upazila: "" });

  const loadTutors = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const query = new URLSearchParams(filters);
    const res = await fetch(`/api/tutors?${query.toString()}`);
    const body = await res.json();
    setTutors(body.tutors || []);
    setLoading(false);
  };

  useEffect(() => {
    loadTutors();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => loadTutors(false), 300);
    return () => clearTimeout(delay);
  }, [filters]);

  const updateFilter = (field) => (event) => setFilters({ ...filters, [field]: event.target.value });

  const handleFilter = async () => {
    await loadTutors();
  };

  const clearFilters = async () => {
    setFilters({ subject: "", district: "", upazila: "" });
    await loadTutors();
  };

  return (
    <div>
      <NavBar />
      <div className="search-page" style={{ paddingTop: "80px" }}>
        <div className="container">
          <div className="search-header">
            <h2>Find a Tutor</h2>
            <p>Search from verified tutors across Bangladesh</p>
          </div>
          <div className="match-note" style={{ marginBottom: "1rem", color: "var(--text2)", fontSize: "0.95rem" }}>
            Results update automatically as you adjust filters.
          </div>
          <div className="filter-bar">
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
              Filter
            </button>
            <button className="btn-clear" onClick={clearFilters}>
              Clear
            </button>
          </div>
          <div className="tutors-grid">
            {loading ? (
              <div className="no-results" style={{ gridColumn: "1/-1" }}>
                <h3>Loading tutors…</h3>
              </div>
            ) : tutors.length ? (
              tutors.map((tutor) => (
                <div key={tutor.id} className="tutor-card" onClick={() => router.push(`/profile/${tutor.id}`)}>
                  <div className="tutor-card-top">
                    <div className="tutor-avatar" style={{ background: tutor.color || "#4f8eff" }}>
                      {tutor.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="tutor-info">
                      <h3>{tutor.name}</h3>
                      <p>
                        {tutor.district}
                        {tutor.upazila ? ", " + tutor.upazila : ""}
                      </p>
                      {tutor.is_verified ? <span className="verified-badge">✓ Verified</span> : null}
                    </div>
                  </div>
                  <div className="subjects-list">
                    {(tutor.subjects || []).map((subject) => (
                      <span key={subject} className="subject-tag">
                        {subject}
                      </span>
                    ))}
                  </div>
                  <div
                    className="tutor-meta"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "0.8rem",
                      color: "var(--text2)",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--border)",
                    }}>
                    <div>
                      <span style={{ color: "var(--gold)" }}>
                        {"★".repeat(Math.floor(tutor.rating || 4)) + "☆".repeat(5 - Math.floor(tutor.rating || 4))}
                      </span>{" "}
                      <span style={{ fontSize: "0.78rem" }}>
                        {parseFloat(tutor.rating || 4).toFixed(1)} ({tutor.reviews_count || 0})
                      </span>
                    </div>
                    <div className="tutor-location">📍 {tutor.upazila || tutor.district}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results" style={{ gridColumn: "1/-1" }}>
                <h3>No tutors found</h3>
                <p>Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
