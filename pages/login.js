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

  const handleLogin = async () => {
    setMessage(null);
    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error || "Invalid email or password.");
      return;
    }
    login(body.user, body.token);
    const target = body.user.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";
    router.push(target);
  };

  return (
    <div>
      <NavBar />
      <div className="auth-page">
        <div className="auth-box">
          <h2>Welcome back</h2>
          <p>Sign in to your Study Bridge account</p>
          {message ? <div className="alert alert-error">{message}</div> : null}
          <div className="role-toggle" style={{ marginBottom: "1rem" }}>
            <button className="role-btn active">👨‍🎓 Student</button>
            <button className="role-btn">👨‍🏫 Teacher</button>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" />
          </div>
          <button className="btn-full" onClick={handleLogin}>
            Sign In
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
