import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { Hero195 } from "../../components/ui/hero-195";
import StatsCard from "../../components/ui/stats-card";
import { Card, CardContent } from "../../components/ui/card";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0 });
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Redirect if a non-teacher accidentally lands here
    if (user && user.role !== "teacher") {
      const dest = user.role === "student" ? "/dashboard/student" : "/login";
      router.push(dest);
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/applications", {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("sbToken")}`,
          },
        });
        const body = await res.json();
        const apps = body.applications || [];
        setApplications(apps);
        setStats({
          total: apps.length,
          pending: apps.filter((app) => app.status === "pending").length,
          confirmed: apps.filter((app) => app.status === "confirmed").length,
        });
      } catch (err) {
        setError("Unable to load applications right now. Please refresh or try again later.");
      }

      try {
        const qs = new URLSearchParams();
        if (user?.district) qs.set("district", user.district);
        if (user?.upazila) qs.set("upazila", user.upazila);
        const resStudents = await fetch(`/api/students?${qs.toString()}`);
        const bodyStudents = await resStudents.json();
        setStudents(bodyStudents.students || []);
      } catch (err) {
        setStudents([]);
        setError((e) => e || "Unable to load nearby students.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, token, router]);

  const updateApp = async (id, status) => {
    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("sbToken")}`,
        },
        body: JSON.stringify({ applicationId: id, status }),
      });
      const res = await fetch("/api/applications", {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("sbToken")}`,
        },
      });
      const body = await res.json();
      const apps = body.applications || [];
      setApplications(apps);
      setStats({
        total: apps.length,
        pending: apps.filter((app) => app.status === "pending").length,
        confirmed: apps.filter((app) => app.status === "confirmed").length,
      });
    } catch (err) {
      setError("Could not update application status.");
    }
  };

  if (!user) return null;

  return (
    <DashboardShell>
      <div className="space-y-4">
        <Hero195 />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <StatsCard title="Total Applications" value={stats.total}>
                Since you joined
              </StatsCard>
              <StatsCard title="Pending Requests" value={stats.pending} delta={`${stats.pending} pending`}>
                Needs your review
              </StatsCard>
            </div>

            <div className="mt-4">
              <Card>
                <CardContent>
                  <h4 className="text-lg font-semibold mb-2">📥 Incoming Applications</h4>
                  {loading ? (
                    <div>Loading applications…</div>
                  ) : applications.length ? (
                    applications
                      .slice()
                      .reverse()
                      .map((app) => (
                        <div key={app.id} className="flex items-start justify-between p-3 border-b last:border-b-0">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center">
                              {app.student_name
                                .split(" ")
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div>
                              <div className="font-medium">{app.student_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {app.subject} · {app.date}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">{app.message}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {app.status === "pending" ? (
                              <>
                                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={() => updateApp(app.id, "confirmed")}>
                                  Accept
                                </button>
                                <button className="px-3 py-1 rounded border" onClick={() => updateApp(app.id, "rejected")}>
                                  Decline
                                </button>
                              </>
                            ) : (
                              <span className="px-3 py-1 rounded bg-muted">{app.status}</span>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="py-6 text-center">No applications yet</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <aside className="space-y-4">
            <StatsCard title="Confirmed" value={stats.confirmed}>
              Confirmed students
            </StatsCard>
            <Card>
              <CardContent>
                <h4 className="text-lg font-semibold mb-2">👥 Students Near You</h4>
                {students.length ? (
                  students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center">
                          {s.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {s.class_level || ""} · {s.district || ""}
                            {s.upazila ? `, ${s.upazila}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 rounded border" onClick={() => router.push(`/messages/${s.id}`)}>
                          Message
                        </button>
                        <button className="px-2 py-1 rounded border" onClick={() => router.push(`/profile/${s.id}?type=student`)}>
                          View
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center">No students found nearby</div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
