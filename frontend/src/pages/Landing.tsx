import { useState } from "react"
import type { FormEvent } from "react"

import { useNavigate } from "react-router-dom"

type Props = {
  user: { email: string } | null
  setUser: (u: { email: string } | null) => void
}

export default function Landing({ user, setUser }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    const API_BASE = "https://travelrecord-backend.onrender.com"

    const url =
      mode === "login"
        ? `${API_BASE}/api/login`
        : `${API_BASE}/api/register`

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()

      if (!res.ok || !json.ok) {
        setMessage(json.error || "Something went wrong")
        return
      }

      if (mode === "register") {
        setMessage("Registered successfully, you can log in now.")
        setMode("login")
      } else {
        setUser({ email: json.email })
        navigate("/home", { replace: true })
      }
    } catch (err) {
      setMessage("Network error")
    } finally {
      setLoading(false)
    }
  }

  // 如果已登入，直接顯示「Go to Home」
  if (user) {
    return (
      <section className="text-center" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h1 className="display-5 fw-bold">Welcome back!</h1>
          <p className="lead text-muted mt-3">
            You are already logged in as <strong>{user.email}</strong>.
          </p>
          <button
            className="btn btn-primary btn-lg px-4"
            onClick={() => navigate("/home")}
          >
            Go to Home
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="position-relative">
      {/* 背景圖形維持原本的 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.15,
          background:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22420%22 height=%22420%22 viewBox=%220 0 420 420%22 fill=%22none%22><path d=%22M210 90v240M90 210h240%22 stroke=%22%23198754%22 stroke-width=%2210%22 stroke-linecap=%22round%22 stroke-dasharray=%2222 22%22/></svg>') no-repeat right -80px bottom -40px",
        }}
      />

      <section
        className="text-center"
        style={{
          paddingTop: "6rem",
          paddingBottom: "6rem",
          background:
            "radial-gradient(1200px 600px at 80% 85%, rgba(13,110,253,.05), transparent 60%)," +
            "radial-gradient(1000px 500px at 10% 20%, rgba(32,201,151,.06), transparent 60%)," +
            "#f8fbff",
        }}
      >
        <div className="container" style={{ maxWidth: 880 }}>
          <h1 className="display-5 fw-bold">Travel Journal</h1>
          <p className="lead text-muted mt-3">
            Capture your adventures, preserve your memories, and organize your journeys all in one place.
          </p>

          <div className="row justify-content-center mt-4">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="btn-group w-100 mb-3">
                    <button
                      type="button"
                      className={`btn ${mode === "login" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => { setMode("login"); setMessage(null); }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className={`btn ${mode === "register" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => { setMode("register"); setMessage(null); }}
                    >
                      Register
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3 text-start">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3 text-start">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    {message && (
                      <div className="alert alert-warning py-2 small">{message}</div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading
                        ? "Processing..."
                        : mode === "login"
                        ? "Login"
                        : "Register"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
