import { useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";

const districts = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Rangpur",
  "Barishal",
  "Mymensingh",
  "Nilphamari",
  "Lalmonirhat",
  "Kurigram",
  "Gaibandha",
];
const upazilas = ["Saidpur", "Nilphamari Sadar", "Jaldhaka", "Dimla", "Kishoreganj", "Domar", "Rangpur Sadar", "Badarganj", "Mithapukur"];

export default function Register() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState("student");
  const [data, setData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    class_level: "",
    district: "",
    subjects: "",
    upazila: "",
  });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("error");

  const handleChange = (field) => (event) => {
    setData({ ...data, [field]: event.target.value });
  };

  const handleRegister = async () => {
    setMessage(null);
    if (!data.name || !data.email || !data.password) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }
    const payload = {
      ...data,
      role,
    };
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(body.error || "Unable to create account.");
      setMessageType("error");
      return;
    }
    login(body.user, body.token);
    router.push(role === "teacher" ? "/dashboard/teacher" : "/dashboard/student");
  };

  return (
    <div>
      <NavBar />
      <div className="auth-page">
        <div className="auth-box">
          <h2>Join Study Bridge</h2>
          <p>Register as a student or teacher to get started</p>
          {message ? <div className={`alert alert-${messageType}`}>{message}</div> : null}
          <div className="role-toggle">
            <button className={`role-btn ${role === "student" ? "active" : ""}`} onClick={() => setRole("student")}>
              👨‍🎓 Student
            </button>
            <button className={`role-btn ${role === "teacher" ? "active" : ""}`} onClick={() => setRole("teacher")}>
              👨‍🏫 Teacher
            </button>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" value={data.name} onChange={handleChange("name")} placeholder="Oli Ahmed Khan" type="text" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input className="form-control" value={data.phone} onChange={handleChange("phone")} placeholder="01700000000" type="text" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" value={data.email} onChange={handleChange("email")} placeholder="you@email.com" type="email" />
          </div>
          {role === "student" ? (
            <div className="form-row">
              <div className="form-group">
                <label>Class / Level</label>
                <select className="form-control" value={data.class_level} onChange={handleChange("class_level")}>
                  <option value="">Select class</option>
                  <option>Class 6</option>
                  <option>Class 7</option>
                  <option>Class 8</option>
                  <option>Class 9</option>
                  <option>Class 10 (SSC)</option>
                  <option>Class 11</option>
                  <option>Class 12 (HSC)</option>
                  <option>University</option>
                </select>
              </div>
              <div className="form-group">
                <label>District</label>
                <select className="form-control" value={data.district} onChange={handleChange("district")}>
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Subjects You Teach</label>
                <input
                  className="form-control"
                  value={data.subjects}
                  onChange={handleChange("subjects")}
                  placeholder="Math, Physics, English"
                  type="text"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>District</label>
                  <select className="form-control" value={data.district} onChange={handleChange("district")}>
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district}>{district}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Upazila</label>
                  <select className="form-control" value={data.upazila} onChange={handleChange("upazila")}>
                    <option value="">Select upazila</option>
                    {upazilas.map((upazila) => (
                      <option key={upazila}>{upazila}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" value={data.password} onChange={handleChange("password")} placeholder="••••••••" type="password" />
          </div>
          <div className="form-group">
            <label>Address Details</label>
            <input className="form-control" value={data.address} onChange={handleChange("address")} placeholder="e.g. AGAN, BAUST" type="text" />
          </div>
          <button className="btn-full" onClick={handleRegister}>
            Create Account
          </button>
          <div className="auth-switch" style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text2)" }}>
            Already have an account?{" "}
            <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => router.push("/login")}>
              Sign In
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
