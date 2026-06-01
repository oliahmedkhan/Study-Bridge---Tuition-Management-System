import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // fetch applications
    fetch("/api/applications", {
      headers: {
        Authorization: `Bearer ${token || localStorage.getItem("sbToken")}`,
      },
    })
      .then((res) => res.json())
      .then((body) => {
        const apps = body.applications || [];
        setApplications(apps);
        setStats({
          total: apps.length,
          pending: apps.filter((app) => app.status === "pending").length,
          confirmed: apps.filter((app) => app.status === "confirmed").length,
        });
      })
      .finally(() => setLoading(false));

    // fetch nearby tutors based on user's location
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (user.district) qs.set("district", user.district);
        if (user.upazila) qs.set("upazila", user.upazila);
        const res = await fetch(`/api/tutors?${qs.toString()}`);
        const body = await res.json();
        setTutors(body.tutors || []);
      } catch (e) {
        setTutors([]);
      }
    })();
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div>
      <NavBar />
      <div className="dashboard-page">
        <div className="dashboard-inner container">
          <div
            className="dash-header"
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <h2 id="student-welcome">Welcome, {user.name.split(" ")[0]}!</h2>
              <p>Manage your tuition applications</p>
            </div>
            <button className="btn-primary" style={{ fontSize: "0.85rem", padding: "10px 18px" }} onClick={() => router.push("/search")}>
              Find More Tutors
            </button>
          </div>
          <div className="dash-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
            <div className="dash-stat">
              <div className="dash-stat-label">Total Applications</div>
              <div className="dash-stat-val">{stats.total}</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-label">Pending</div>
              <div className="dash-stat-val" style={{ color: "var(--gold)" }}>
                {stats.pending}
              </div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-label">Confirmed</div>
              <div className="dash-stat-val" style={{ color: "var(--accent3)" }}>
                {stats.confirmed}
              </div>
            </div>
          </div>
          <h4 className="dash-section-title">📋 My Applications</h4>
          {loading ? (
            <div className="empty-state">
              <h4>Loading applications…</h4>
            </div>
          ) : applications.length ? (
            applications
              .slice()
              .reverse()
              .map((app) => (
                <div key={app.id} className="app-card">
                  <div className="app-card-left">
                    <div className="app-mini-avatar" style={{ background: "var(--accent)" }}>
                      {app.tutor_name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div className="app-name">{app.tutor_name}</div>
                      <div className="app-meta">
                        {app.subject} · Sent {app.date}
                      </div>
                    </div>
                  </div>
                  <div className="app-card-right">
                    <span className={`status-badge status-${app.status}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                  </div>
                </div>
              ))
          ) : (
            <div className="empty-state">
              <h4>No applications yet</h4>
              <p>Browse tutors and send your first application!</p>
              <br />
              <button className="btn-primary" style={{ fontSize: ".85rem", padding: "9px 18px" }} onClick={() => router.push("/search")}>
                Find Tutors
              </button>
            </div>
          )}

          <h4 className="dash-section-title">📚 Tutors Near You</h4>
          {tutors.length ? (
            tutors.map((t) => (
              <div key={t.id} className="app-card">
                <div className="app-card-left">
                  <div className="app-mini-avatar" style={{ background: "var(--accent)" }}>
                    {t.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="app-name">{t.name}</div>
                    <div className="app-meta">
                      {t.class_level || ""} · {t.district || ""}
                      {t.upazila ? `, ${t.upazila}` : ""}
                    </div>
                  </div>
                </div>
                <div className="app-card-right">
                  <button className="btn-sm" onClick={() => router.push(`/profile/${t.id}`)}>
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h4>No tutors found nearby</h4>
              <p>Try broadening your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
