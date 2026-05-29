import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav>
      <div className="nav-logo" onClick={() => router.push("/")}>
        <span className="nav-dot" />
        Study<span>Bridge</span>
      </div>
      {user ? (
        <div className="nav-user">
          <button className="nav-btn nav-btn-ghost" onClick={() => router.push("/search")}>
            Find Tutors
          </button>
          <button
            className="nav-btn nav-btn-ghost"
            onClick={() => router.push(user.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student")}>
            Dashboard
          </button>
          <div className="avatar">
            {user.name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </div>
          <button
            className="nav-btn nav-btn-ghost"
            onClick={() => {
              logout();
              router.push("/");
            }}
            style={{ color: "var(--text3)", fontSize: "0.8rem" }}>
            Logout
          </button>
        </div>
      ) : (
        <div className="nav-links">
          <button className="nav-btn nav-btn-ghost" onClick={() => router.push("/search")}>
            Find Tutors
          </button>
          <button className="nav-btn nav-btn-ghost" onClick={() => router.push("/login")}>
            Sign In
          </button>
          <button className="nav-btn nav-btn-solid" onClick={() => router.push("/register")}>
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}
