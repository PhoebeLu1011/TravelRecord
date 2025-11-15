import { useEffect, useState, type ReactElement } from "react"
import { Routes, Route, Link,NavLink, Navigate, useNavigate } from "react-router-dom"
import Landing from "./pages/Landing"
import Home from "./pages/Home"
import AddRecord from "./pages/AddRecord"
import BulkUpload from "./pages/BulkUpload"

type User = { email: string } | null
function ProtectedRoute({
  user,
  children,
}: {
  user: User
  children: ReactElement
}) {
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // 一進入 App 就問後端現在是不是有登入
  useEffect(() => {
    fetch("/api/me", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("not logged in")
        return res.json()
      })
      .then(json => {
        if (json.ok) setUser({ email: json.email })
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
    navigate("/", { replace: true })
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status" />
      </div>
    )
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to={user ? "/home" : "/"}>
            Travel Journal
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNavbar">
            {/* 左邊：只有登入後才顯示三個功能按鈕 */}
            {user && (
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/home">
                    History
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/add">
                    Add Record
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/bulk">
                    Bulk Upload
                  </NavLink>
                </li>
              </ul>
            )}

            {/* 右邊：登入狀態 / Logout */}
            <div className="navbar-nav ms-auto">
              {user ? (
                <>
                  <span className="navbar-text me-3">{user.email}</span>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <span className="navbar-text text-muted">Welcome</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <Routes>
          {/* Landing 畫面：同時放登入/註冊表單 */}
          <Route path="/" element={<Landing user={user} setUser={setUser} />} />

          {/* 需要登入的頁 */}
          <Route
            path="/home"
            element={
              <ProtectedRoute user={user}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute user={user}>
                <AddRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bulk"
            element={
              <ProtectedRoute user={user}>
                <BulkUpload />
              </ProtectedRoute>
            }
          />

          {/* 舊的 /app 等都導到 Landing 或 home */}
          <Route path="/app" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}
