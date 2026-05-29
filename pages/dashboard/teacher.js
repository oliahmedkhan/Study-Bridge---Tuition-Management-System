import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import { useAuth } from "../../context/AuthContext";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetch("/api/applications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("sbToken")}`,
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

    // fetch nearby students based on teacher's location
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (user.district) qs.set("district", user.district);
        if (user.upazila) qs.set("upazila", user.upazila);
        const res = await fetch(`/api/students?${qs.toString()}`);
        const body = await res.json();
        setStudents(body.students || []);
      } catch (e) {
        setStudents([]);
      }
    })();
  }, [user]);

  const updateApp = async (id, status) => {
    await fetch("/api/applications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("sbToken")}`,
      },
      body: JSON.stringify({ applicationId: id, status }),
    });
    const body = await fetch("/api/applications", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("sbToken")}`,
      },
    }).then((res) => res.json());
    const apps = body.applications || [];
    setApplications(apps);
    setStats({
      total: apps.length,
      pending: apps.filter((app) => app.status === "pending").length,
      confirmed: apps.filter((app) => app.status === "confirmed").length,
    });
  };

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
              <h2 id="teacher-welcome">Welcome, {user.name.split(" ")[0]}!</h2>
              <p>Manage your students and profile</p>
            </div>
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
              <div className="dash-stat-label">Active Students</div>
              <div className="dash-stat-val" style={{ color: "var(--accent3)" }}>
                {stats.confirmed}
              </div>
            </div>
          </div>
          <h4 className="dash-section-title">📥 Incoming Applications</h4>
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
                    <div className="app-mini-avatar" style={{ background: "var(--accent2)" }}>
                      {app.student_name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <div className="app-name">{app.student_name}</div>
                      <div className="app-meta">
                        {app.subject} · {app.date}
                      </div>
                      <div style={{ fontSize: ".78rem", color: "var(--text3)", marginTop: "3px", maxWidth: "300px" }}>{app.message}</div>
                    </div>
                  </div>
                  <div className="app-card-right">
                    {app.status === "pending" ? (
                      <>
                        <button className="btn-sm btn-sm-green" onClick={() => updateApp(app.id, "confirmed")}>
                          Accept
                        </button>
                        <button className="btn-sm btn-sm-red" onClick={() => updateApp(app.id, "rejected")}>
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className={`status-badge status-${app.status}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <div className="empty-state">
              <h4>No applications yet</h4>
              <p>Applications from students will appear here.</p>
            </div>
          )}

          <h4 className="dash-section-title">👥 Students Near You</h4>
          {students.length ? (
            students.map((s) => (
              <div key={s.id} className="app-card">
                <div className="app-card-left">
                  <div className="app-mini-avatar" style={{ background: "var(--accent2)" }}>
                    {s.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="app-name">{s.name}</div>
                    <div className="app-meta">
                      {s.class_level || ""} · {s.district || ""}
                      {s.upazila ? `, ${s.upazila}` : ""}
                    </div>
                  </div>
                </div>
                <div className="app-card-right">
                  <button className="btn-sm" onClick={() => router.push(`/profile/${s.id}`)}>
                    View
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h4>No students found nearby</h4>
              <p>Try expanding your location filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
