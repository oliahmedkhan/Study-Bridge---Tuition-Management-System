import Link from "next/link";
import NavBar from "../components/NavBar";

export default function Home() {
  return (
    <div>
      <NavBar />
      <section id="page-home">
        <div className="hero" style={{ position: "relative", overflow: "hidden", minHeight: "100vh" }}>
          <div className="hero-bg" />
          <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
            <div className="hero-badge">🎓 Bangladesh's Tuition Platform</div>
            <h1 style={{ marginTop: "1.5rem", fontSize: "clamp(2.8rem, 8vw, 5.5rem)", fontWeight: 800, lineHeight: 1.05 }}>
              Connect Students
              <br />
              with the <span className="hl">Right Tutor</span>
            </h1>
            <p style={{ color: "var(--text2)", maxWidth: "520px", margin: "1.5rem auto 2rem", lineHeight: 1.7, fontSize: "1.1rem" }}>
              Study Bridge links students, guardians, and tutors across all 64 districts of Bangladesh — verified, searchable, and free from scams.
            </p>
            <div className="hero-cta" style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={() => window.location.assign("/register")}>
                Join as Student
              </button>
              <button className="btn-secondary" onClick={() => window.location.assign("/register")}>
                Register as Tutor
              </button>
            </div>
            <div
              className="stats-row"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "3rem",
                flexWrap: "wrap",
                marginTop: "4rem",
                paddingTop: "3rem",
                borderTop: "1px solid var(--border)",
              }}>
              <div className="stat">
                <div className="stat-num">1,200+</div>
                <div className="stat-label">Verified Tutors</div>
              </div>
              <div className="stat">
                <div className="stat-num">64</div>
                <div className="stat-label">Districts Covered</div>
              </div>
              <div className="stat">
                <div className="stat-num">8,500+</div>
                <div className="stat-label">Students Connected</div>
              </div>
              <div className="stat">
                <div className="stat-num">4.8★</div>
                <div className="stat-label">Avg. Rating</div>
              </div>
            </div>
          </div>
        </div>
        <div className="section">
          <div className="section-title">Everything you need</div>
          <div className="section-sub">A complete platform built for Bangladesh's education needs</div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(79, 142, 255, 0.15)" }}>
                🔍
              </div>
              <h3>Smart Search & Filter</h3>
              <p>Find tutors by district, upazila, subject, and class level. Location-aware results for rural and urban areas alike.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(6, 214, 160, 0.15)" }}>
                ✅
              </div>
              <h3>Verified Badges</h3>
              <p>Tutors go through a credential verification process. Verified badges build trust and eliminate scam profiles.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(124, 58, 237, 0.15)" }}>
                ⭐
              </div>
              <h3>Ratings & Reviews</h3>
              <p>Honest feedback from real students and guardians. Accountability built into every tutor profile.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(245, 158, 11, 0.15)" }}>
                📊
              </div>
              <h3>Application Dashboard</h3>
              <p>Track tuition applications, accept requests, and manage your teaching schedule — all in one place.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(239, 68, 68, 0.15)" }}>
                🗺️
              </div>
              <h3>All 64 Districts</h3>
              <p>Unlike city-focused platforms, Study Bridge covers every upazila in Bangladesh. No region is left behind.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "rgba(6, 214, 160, 0.15)" }}>
                🔒
              </div>
              <h3>Secure Platform</h3>
              <p>Safe registration, encrypted data, and an admin moderation system to keep the platform trustworthy.</p>
            </div>
          </div>
        </div>
        <div className="how-section" style={{ background: "var(--bg2)", padding: "5rem 2rem" }}>
          <div className="how-inner" style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
            <div className="section-title">How it works</div>
            <div className="section-sub">Three simple steps to connect</div>
            <div
              className="steps-row"
              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", marginTop: "3rem" }}>
              <div className="step">
                <div className="step-num">1</div>
                <h4>Create your profile</h4>
                <p>Sign up as a student or tutor. Fill in your location, subjects, and details in minutes.</p>
              </div>
              <div className="step">
                <div className="step-num">2</div>
                <h4>Search & connect</h4>
                <p>Students search by district and subject. Tutors receive applications from interested students.</p>
              </div>
              <div className="step">
                <div className="step-num">3</div>
                <h4>Start learning</h4>
                <p>Confirm the tuition, manage sessions through your dashboard, and leave a review after.</p>
              </div>
            </div>
          </div>
        </div>
        <footer className="footer">
          <p>© 2026 Study Bridge · CSE 3200 Web Engineering Project · BAUST, Saidpur</p>
          <p style={{ marginTop: "0.25rem" }}>Oli Ahmed Khan · Fous Bin Taher Tanjim</p>
        </footer>
      </section>
    </div>
  );
}
