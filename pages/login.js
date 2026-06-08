import { useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMessage(null);
    if (!email.trim() || !password.trim()) {
      setMessage("Please enter email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const body = await res.json();
      if (!res.ok) {
        setMessage(body.error || "Invalid email or password.");
        return;
      }
      login(body.user, body.token);
      const target = body.user.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
      router.push(target);
    } catch (err) {
      setMessage("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="auth-page">
        <div className="auth-box">
          <h2>Welcome back</h2>
          <p>Sign in to your Study Bridge account</p>
          {message ? <div className="alert alert-error">{message}</div> : null}
          <div className="role-toggle" style={{ marginBottom: "1rem", justifyContent: "center" }}>
            <span style={{ color: "var(--text2)", fontSize: "0.95rem" }}>Sign in with your existing student or teacher account.</span>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              type="email"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
            />
          </div>
          <button className="btn-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <div className="auth-switch" style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text2)" }}>
            New to Study Bridge?{" "}
            <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => router.push("/register")}>
              Create Account
            </span>
          </div>
          <div
            style={{
              marginTop: "1rem",
              padding: "10px",
              background: "var(--bg2)",
              borderRadius: "var(--r2)",
              fontSize: "0.78rem",
              color: "var(--text3)",
              textAlign: "center",
            }}>
            Demo: register and login with any email + password.
          </div>
        </div>
      </div>
    </div>
  );
}
