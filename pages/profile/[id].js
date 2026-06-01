import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tutors?id=${id}`)
      .then((res) => res.json())
      .then((body) => {
        const tutorData = body.tutor || null;
        setTutor(tutorData);
        setReviews(body.reviews || []);
        if (tutorData?.subjects?.length) {
          setSubject(tutorData.subjects[0]);
        }
      });
  }, [id]);

  const openModal = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setModalOpen(true);
  };

  const submitApplication = async () => {
    if (!note.trim()) {
      setMessage("Please write a message.");
      return;
    }
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || localStorage.getItem("sbToken")}`,
      },
      body: JSON.stringify({ tutorId: tutor.id, message: note, subject }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error || "Unable to send application.");
      return;
    }
    setMessage("Application sent successfully!");
    setModalOpen(false);
    setNote("");
  };

  if (!tutor) {
    return (
      <div>
        <NavBar />
        <div className="search-page" style={{ paddingTop: "80px" }}>
          <div className="container">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="profile-page">
        <div className="profile-inner container">
          <button className="back-btn" onClick={() => router.push("/search")}>
            ← Back to Search
          </button>
          <div className="profile-hero">
            <div className="profile-avatar" style={{ background: tutor.color || "#4f8eff" }}>
              {tutor.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div className="profile-name">{tutor.name}</div>
              <div className="profile-sub">
                {tutor.district}
                {tutor.upazila ? `, ${tutor.upazila}` : ""}
              </div>
              {tutor.is_verified ? (
                <span className="verified-badge">✓ Verified</span>
              ) : (
                <span style={{ fontSize: ".75rem", color: "var(--text3)" }}>Not yet verified</span>
              )}
              <div style={{ marginTop: ".75rem", color: "var(--text2)", fontSize: ".88rem", lineHeight: 1.6 }}>
                {tutor.bio || "Experienced tutor available for private tuition."}
              </div>
              <div className="profile-actions" style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {user?.role === "student" ? (
                  <>
                    <button className="btn-apply" onClick={() => router.push(`/messages/${tutor.id}`)}>
                      Message Tutor
                    </button>
                    <button className="btn-apply" onClick={openModal}>
                      Apply for Tuition
                    </button>
                  </>
                ) : null}
                {!user ? (
                  <button className="btn-apply" onClick={() => router.push("/login")}>
                    Sign In to Apply
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="profile-grid">
            <div className="profile-card">
              <h4>Details</h4>
              <div className="info-row">
                <span>Subjects</span>
                <span>{(tutor.subjects || []).join(", ")}</span>
              </div>
              <div className="info-row">
                <span>Class Levels</span>
                <span>{tutor.class_levels || "—"}</span>
              </div>
              <div className="info-row">
                <span>District</span>
                <span>{tutor.district}</span>
              </div>
              <div className="info-row">
                <span>Upazila</span>
                <span>{tutor.upazila || "—"}</span>
              </div>
              <div className="info-row">
                <span>Address</span>
                <span>{tutor.address || "—"}</span>
              </div>
            </div>
            <div className="profile-card">
              <h4>Rating</h4>
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "3rem", color: "var(--gold)" }}>
                  {"★".repeat(Math.floor(tutor.rating || 4)) + "☆".repeat(5 - Math.floor(tutor.rating || 4))}
                </div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, margin: ".25rem 0" }}>
                  {parseFloat(tutor.rating || 4).toFixed(1)}
                </div>
                <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>{tutor.reviews_count || 0} reviews</div>
              </div>
            </div>
          </div>
          <div className="reviews-section">
            <h4 className="dash-section-title">⭐ Student Reviews</h4>
            <div>
              {reviews.length ? (
                reviews.map((review, index) => (
                  <div key={index} className="review-card">
                    <div className="review-header" style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span className="reviewer-name">{review.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="stars" style={{ fontSize: ".9rem" }}>
                          {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                        </span>
                        <span className="review-date">{review.date}</span>
                      </div>
                    </div>
                    <div className="review-text" style={{ fontSize: ".85rem", color: "var(--text2)", lineHeight: 1.6 }}>
                      {review.text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h4>No reviews yet</h4>
                  <p>Be the first to review this tutor.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {modalOpen ? (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Send Application</h3>
            <p>Send a tuition request to {tutor.name}</p>
            {tutor?.subjects?.length ? (
              <div className="form-group">
                <label>Subject</label>
                <select className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {tutor.subjects.map((subjectName) => (
                    <option key={subjectName} value={subjectName}>
                      {subjectName}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="form-group">
              <label>Your Message</label>
              <textarea
                className="form-control"
                rows="4"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Hi, I am looking for a tutor for Class 10 Math. I live in Saidpur..."
              />
            </div>
            {message ? <div className="alert alert-error">{message}</div> : null}
            <div className="modal-actions" style={{ display: "flex", gap: "8px", marginTop: "1.25rem" }}>
              <button className="btn-full" onClick={submitApplication} style={{ marginTop: 0 }}>
                Send Application
              </button>
              <button
                className="btn-full"
                onClick={() => setModalOpen(false)}
                style={{ marginTop: 0, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
