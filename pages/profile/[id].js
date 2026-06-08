import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { id, type } = router.query;
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileType, setProfileType] = useState("tutor");
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const selectedType = type === "student" || type === "tutor" ? type : null;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (selectedType) {
          const endpoint = selectedType === "student" ? "/api/students" : "/api/tutors";
          const res = await fetch(`${endpoint}?id=${id}`);
          const body = await res.json();
          const item = selectedType === "student" ? body.student : body.tutor;
          setProfile(item || null);
          setProfileType(selectedType);
          if (selectedType === "tutor") {
            setReviews(body.reviews || []);
            if (item?.subjects?.length) setSubject(item.subjects[0]);
          }
        } else {
          const tutorRes = await fetch(`/api/tutors?id=${id}`);
          const tutorBody = await tutorRes.json();
          if (tutorRes.ok && tutorBody.tutor) {
            setProfile(tutorBody.tutor);
            setProfileType("tutor");
            setReviews(tutorBody.reviews || []);
            if (tutorBody.tutor?.subjects?.length) setSubject(tutorBody.tutor.subjects[0]);
          } else {
            const studentRes = await fetch(`/api/students?id=${id}`);
            const studentBody = await studentRes.json();
            if (studentRes.ok && studentBody.student) {
              setProfile(studentBody.student);
              setProfileType("student");
            } else {
              setProfile(null);
            }
          }
        }
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, type, router.isReady]);

  const openModal = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Only students may apply for tuition on tutor profiles
    if (user.role !== "student" || profileType !== "tutor") {
      router.push(user.role === "teacher" ? "/dashboard/teacher" : "/");
      return;
    }
    setModalOpen(true);
  };

  const submitApplication = async () => {
    if (!note.trim()) {
      setMessage("Please write a message.");
      return;
    }
    if (profileType !== "tutor") {
      setMessage("Cannot apply to this profile.");
      return;
    }
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token || localStorage.getItem("sbToken")}`,
      },
      body: JSON.stringify({ tutorId: profile.id, message: note, subject }),
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

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="search-page">
          <div className="container">
            <div className="empty-state">
              <h4>Loading profile…</h4>
              <p>Please wait while we fetch the latest information.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <NavBar />
        <div className="search-page">
          <div className="container">
            <div className="empty-state">
              <h4>Profile not found</h4>
              <p>The requested profile does not exist or may have been removed.</p>
              <button className="btn-primary" onClick={() => router.push("/search")}>
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isStudentUser = user?.role === "student";
  const isTeacherUser = user?.role === "teacher";
  const isTutorProfile = profileType === "tutor";
  const isStudentProfile = profileType === "student";

  return (
    <div>
      <NavBar />
      <div className="profile-page">
        <div className="profile-inner container">
          <button className="back-btn" onClick={() => router.push("/search")}>
            ← Back to Search
          </button>
          <div className="profile-hero">
            <div className="profile-avatar" style={{ background: profile.color || "#2e7d32" }}>
              {profile.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div className="profile-name">{profile.name}</div>
              <div className="profile-sub">
                {profile.district}
                {profile.upazila ? `, ${profile.upazila}` : ""}
              </div>
              {isTutorProfile ? (
                profile.is_verified ? (
                  <span className="verified-badge">✓ Verified</span>
                ) : (
                  <span style={{ fontSize: ".75rem", color: "var(--text3)" }}>Not yet verified</span>
                )
              ) : (
                <span
                  className="verified-badge"
                  style={{ background: "rgba(46, 125, 50, 0.1)", borderColor: "rgba(46, 125, 50, 0.2)", color: "var(--accent)" }}>
                  Student profile
                </span>
              )}
              {!profile.bio && <div style={{ marginTop: ".5rem", color: "var(--text3)" }}>No biography provided.</div>}
              <div style={{ marginTop: ".75rem", color: "var(--text2)", fontSize: ".88rem", lineHeight: 1.6 }}>
                {profile.bio ||
                  (isTutorProfile ? "Experienced tutor available for private tuition." : "Motivated student searching for the right tutor.")}
              </div>
              <div className="profile-actions" style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {isStudentUser && isTutorProfile ? (
                  <>
                    <button className="btn-apply" onClick={() => router.push(`/messages/${profile.id}`)}>
                      Message Tutor
                    </button>
                    <button className="btn-apply" onClick={openModal}>
                      Apply for Tuition
                    </button>
                  </>
                ) : null}
                {isTeacherUser && isStudentProfile ? (
                  <button className="btn-apply" onClick={() => router.push(`/messages/${profile.id}`)}>
                    Message Student
                  </button>
                ) : null}
                {!user && isTutorProfile ? (
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
              {isTutorProfile ? (
                <>
                  <div className="info-row">
                    <span>Subjects</span>
                    <span>{(profile.subjects || []).join(", ") || "—"}</span>
                  </div>
                  <div className="info-row">
                    <span>Class Levels</span>
                    <span>{profile.class_level || "—"}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="info-row">
                    <span>Class Level</span>
                    <span>{profile.class_level || "—"}</span>
                  </div>
                </>
              )}
              <div className="info-row">
                <span>District</span>
                <span>{profile.district || "—"}</span>
              </div>
              <div className="info-row">
                <span>Upazila</span>
                <span>{profile.upazila || "—"}</span>
              </div>
              <div className="info-row">
                <span>Address</span>
                <span>{profile.address || "—"}</span>
              </div>
            </div>
            {isTutorProfile ? (
              <div className="profile-card">
                <h4>Rating</h4>
                <div style={{ textAlign: "center", padding: "1rem 0" }}>
                  <div style={{ fontSize: "3rem", color: "var(--gold)" }}>
                    {"★".repeat(Math.floor(profile.rating || 4)) + "☆".repeat(5 - Math.floor(profile.rating || 4))}
                  </div>
                  <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 800, margin: ".25rem 0" }}>
                    {parseFloat(profile.rating || 4).toFixed(1)}
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>{profile.reviews_count || 0} reviews</div>
                </div>
              </div>
            ) : null}
            {!isTutorProfile && !profile.class_level && (
              <div className="profile-card">
                <h4>Details</h4>
                <div style={{ color: "var(--text3)" }}>No additional details provided.</div>
              </div>
            )}
          </div>
          {isTutorProfile ? (
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
          ) : null}
        </div>
      </div>
      {isTutorProfile && modalOpen ? (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Send Application</h3>
            <p>Send a tuition request to {profile.name}</p>
            {profile?.subjects?.length ? (
              <div className="form-group">
                <label>Subject</label>
                <select className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {profile.subjects.map((subjectName) => (
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
