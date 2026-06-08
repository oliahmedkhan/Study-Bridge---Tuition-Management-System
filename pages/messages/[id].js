import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../../components/NavBar";
import { useAuth } from "../../context/AuthContext";

export default function MessagesPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [otherName, setOtherName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchConversation = async () => {
    if (!id || !token) return;
    setLoading(true);
    const res = await fetch(`/api/messages?otherId=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    setMessages(body.messages || []);
    if (!res.ok) {
      setMessages([]);
      setOtherName("Unknown user");
    }
    setLoading(false);
  };

  const fetchOtherName = async () => {
    if (!id || !user) return;
    const endpoint = user.role === "student" ? "/api/tutors" : "/api/students";
    const res = await fetch(`${endpoint}?id=${id}`);
    const body = await res.json();
    const name = body.tutor?.name || body.student?.name || `User ${id}`;
    setOtherName(name);
  };

  useEffect(() => {
    fetchOtherName();
  }, [id, user]);

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [id, token]);

  const handleSend = async () => {
    if (!content.trim() || !id) return;
    await fetch("/api/messages", {
      method: "POST",
      body: JSON.stringify({ recipientId: id, content }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setContent("");
    await fetchConversation();
  };

  return (
    <div className="page-shell min-h-screen bg-slate-950 text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl shadow-black/20">
          <h1 className="text-2xl font-semibold">Message {otherName || "Tutor/Student"}</h1>
          <p className="mt-2 text-sm text-slate-400">Messages sync automatically every few seconds.</p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-300">Loading conversation…</div>
          ) : messages.length ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl p-4 ${message.sender_id === user?.id ? "ml-auto bg-slate-800 text-slate-100" : "bg-slate-900 text-slate-200"}`}
                style={{ maxWidth: "80%" }}>
                <div className="text-xs text-slate-500">{message.sender_name}</div>
                <div className="mt-2 whitespace-pre-wrap">{message.content}</div>
                <div className="mt-3 text-right text-xs text-slate-500">{message.created_at}</div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-300">No messages yet. Send the first one.</div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Type your message..."
            className="min-h-[120px] rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-slate-500"
          />
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => router.back()}
              className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2 text-sm text-slate-200 hover:bg-slate-700">
              Back
            </button>
            <button onClick={handleSend} className="rounded-2xl bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400">
              Send Message
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
