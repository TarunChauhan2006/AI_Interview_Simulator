import { useEffect, useMemo, useState } from "react";
import "./index.css";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [resume, setResume] = useState(null);
  const [role, setRole] = useState("AI/ML Intern");
  const [level, setLevel] = useState("Medium");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    let id;
    if (timerOn) {
      id = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(id);
  }, [timerOn]);

  const score = useMemo(() => {
    const match = feedback.match(/Score:\s*(\d+)/i);
    return match ? Number(match[1]) : 0;
  }, [feedback]);

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  async function uploadResume() {
    if (!resume) return alert("Resume select karo");

    const form = new FormData();
    form.append("file", resume);

    setLoading(true);
    const res = await fetch(`${API}/upload-resume`, { method: "POST", body: form });
    await res.json();
    setLoading(false);
    alert("Resume uploaded ✅");
  }

  async function getQuestion() {
    const form = new FormData();
    form.append("role", role);
    form.append("level", level);

    setLoading(true);
    const res = await fetch(`${API}/question`, { method: "POST", body: form });
    const data = await res.json();

    setQuestion(data.question);
    setAnswer("");
    setFeedback("");
    setSeconds(0);
    setTimerOn(true);
    setLoading(false);
  }

  async function submitAnswer() {
    if (!question || !answer) return alert("Question aur answer required hai");

    const form = new FormData();
    form.append("question", question);
    form.append("answer_text", answer);

    setLoading(true);
    const res = await fetch(`${API}/answer`, { method: "POST", body: form });
    const data = await res.json();

    setFeedback(data.feedback);
    setTimerOn(false);

    setHistory((old) => [
      {
        question,
        answer,
        feedback: data.feedback,
        time: formatTime(seconds),
        date: new Date().toLocaleString(),
      },
      ...old,
    ]);

    setLoading(false);
  }

  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition Chrome me support hota hai. Chrome use karo.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setAnswer((prev) => (prev ? prev + " " + text : text));
    };

    recognition.start();
  }

  function downloadReport() {
    const report = `
AI INTERVIEW SIMULATOR REPORT

Role: ${role}
Level: ${level}
Time Taken: ${formatTime(seconds)}

Question:
${question}

Answer:
${answer}

Feedback:
${feedback}
`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "AI_Interview_Report.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="tag">Advanced LLM Project</p>
        <h1>AI Interview Simulator</h1>
        <p>
          Resume based HR + technical interview with AI feedback, voice answer,
          timer, scoring and report download.
        </p>
      </section>

      <section className="stats">
        <div>
          <span>Timer</span>
          <strong>{formatTime(seconds)}</strong>
        </div>
        <div>
          <span>Score</span>
          <strong>{score}/10</strong>
        </div>
        <div>
          <span>Attempts</span>
          <strong>{history.length}</strong>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>1. Resume Upload</h2>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setResume(e.target.files[0])}
          />
          <button onClick={uploadResume}>
            {loading ? "Processing..." : "Upload Resume"}
          </button>
        </div>

        <div className="card">
          <h2>2. Interview Setup</h2>

          <label>Role</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} />

          <label>Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <button onClick={getQuestion}>
            {loading ? "Generating..." : "Generate Question"}
          </button>
        </div>
      </section>

      <section className="card interview">
        <div className="row">
          <h2>3. AI Interview</h2>
          <div className={timerOn ? "live" : "idle"}>
            {timerOn ? "Live Interview" : "Idle"}
          </div>
        </div>

        <div className="question">{question || "Question yahan show hoga..."}</div>

        <textarea
          placeholder="Apna answer yahan likho ya voice se bolo..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="actions">
          <button onClick={startVoice}>
            {listening ? "Listening..." : "🎤 Voice Answer"}
          </button>

          <button onClick={submitAnswer}>
            {loading ? "Evaluating..." : "Submit Answer"}
          </button>

          {feedback && <button onClick={downloadReport}>Download Report</button>}
        </div>
      </section>

      {feedback && (
        <section className="card feedback">
          <h2>4. AI Feedback Report</h2>

          <div className="scoreBox">
            <div className="scoreCircle">{score}/10</div>
            <div className="bar">
              <div style={{ width: `${score * 10}%` }}></div>
            </div>
          </div>

          <pre>{feedback}</pre>
        </section>
      )}

      {history.length > 0 && (
        <section className="card">
          <h2>5. Interview History</h2>
          {history.map((item, index) => (
            <div className="history" key={index}>
              <strong>{item.date}</strong>
              <p>{item.question}</p>
              <small>Time: {item.time}</small>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}