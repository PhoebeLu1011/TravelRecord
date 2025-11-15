import { useEffect,useState } from "react"
import type { FormEvent } from "react"
import { API_BASE } from "../config";


type Trip = {
  date?: string
  title?: string
  city?: string
  country?: string
  note?: string
}

export default function Journal() {
  const [data, setData] = useState<Trip[]>([])
  const [single, setSingle] = useState<Trip>({})
  const [jsonText, setJsonText] = useState('')
  const [singleResp, setSingleResp] = useState('')
  const [bulkResp, setBulkResp] = useState('')
  const [jsonResp, setJsonResp] = useState('')

  async function loadAll() {
    const res = await fetch(`${API_BASE}/api/all`, { credentials: "include" })
    const json = await res.json()
    setData(Array.isArray(json) ? json : [])
  }

  useEffect(() => { loadAll() }, [])

  async function onSubmitSingle(e: FormEvent) {
    e.preventDefault()
    const res = await fetch(`${API_BASE}/api/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(single),
    })
    const json = await res.json()
    setSingleResp(JSON.stringify(json, null, 2))
    setSingle({})
    loadAll()
  }

  async function onSubmitBulkFile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const res = await fetch(`${API_BASE}/api/bulk`, {
      method: "POST",
      credentials: "include",
      body: fd,
    })
    const json = await res.json()
    setBulkResp(JSON.stringify(json, null, 2))
    ;(form.querySelector('input[type="file"]') as HTMLInputElement).value = ''
    loadAll()
  }

  async function onSubmitJson(e: FormEvent) {
    e.preventDefault()
    let parsed
    try { parsed = JSON.parse(jsonText.trim()) } 
    catch { alert('❌ Invalid JSON format.'); return }
    const res = await fetch(`${API_BASE}/api/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsed),
    })
    const json = await res.json()
    setJsonResp(JSON.stringify(json, null, 2))
    setJsonText('')
    loadAll()
  }

  const sorted = [...data].sort((a, b) =>
    new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  )

  return (
    <div className="container py-5">
      <header className="text-center mb-4">
        <h1 className="fw-bold">Travel Journal</h1>
        <p className="text-muted">Submit trips manually, upload files, or paste JSON — all in one place.</p>
      </header>

      <main className="d-flex flex-column gap-4">
        {/* 單筆新增 */}
        <form onSubmit={onSubmitSingle} className="card shadow-sm p-4">
          <h5 className="mb-3 text-primary">Add Single Record</h5>

          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              placeholder="e.g., Kyoto Trip"
              value={single.title || ''}
              onChange={e => setSingle(s => ({ ...s, title: e.target.value }))}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={single.date || ''}
              onChange={e => setSingle(s => ({ ...s, date: e.target.value }))}
            />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">City</label>
              <input
                className="form-control"
                placeholder="Kyoto"
                value={single.city || ''}
                onChange={e => setSingle(s => ({ ...s, city: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Country</label>
              <input
                className="form-control"
                placeholder="Japan"
                value={single.country || ''}
                onChange={e => setSingle(s => ({ ...s, country: e.target.value }))}
              />
            </div>
          </div>

          <div className="mb-3 mt-3">
            <label className="form-label">Note</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Write something about your experience..."
              value={single.note || ''}
              onChange={e => setSingle(s => ({ ...s, note: e.target.value }))}
            />
          </div>

          <button className="btn btn-primary w-100">Submit Record</button>
          {singleResp && <pre className="bg-body-tertiary p-2 mt-3 rounded small">{singleResp}</pre>}
        </form>

        {/* 批次匯入：CSV / JSON 上傳 */}
        <form onSubmit={onSubmitBulkFile} className="card shadow-sm p-4" encType="multipart/form-data">
          <h5 className="mb-3 text-primary">Upload CSV / JSON (Bulk Insert)</h5>
          <div className="mb-3">
            <label className="form-label">Select File</label>
            <input name="file" type="file" className="form-control" accept=".csv,.json" required />
          </div>
          <button className="btn btn-success w-100">Upload File</button>
          {bulkResp && <pre className="bg-body-tertiary p-2 mt-3 rounded small">{bulkResp}</pre>}
        </form>

        {/* JSON 手動輸入 */}
        <form onSubmit={onSubmitJson} className="card shadow-sm p-4">
          <h5 className="mb-3 text-primary">Paste JSON Data</h5>
          <p className="text-muted small">
            Example: <code>[{"{"}"title":"Kyoto","date":"2025-03-15","city":"Kyoto"{"}"}]</code>
          </p>
          <textarea
            className="form-control"
            rows={8}
            placeholder='[{"title":"Sample Trip","city":"Tokyo","country":"Japan"}]'
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            required
          />
          <button className="btn btn-info text-white w-100 mt-3">Submit JSON</button>
          {jsonResp && <pre className="bg-body-tertiary p-2 mt-3 rounded small">{jsonResp}</pre>}
        </form>
      </main>

      {/* 資料表 */}
      <section className="mt-5">
        <h3 className="text-primary mb-3">All Travel Records</h3>

        {sorted.length === 0 ? (
          <div className="alert alert-secondary text-center">No data yet. Add or upload to see records here.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-primary">
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d, i) => (
                  <tr key={i}>
                    <td>{d.date || ''}</td>
                    <td>{d.title || ''}</td>
                    <td>{d.city || ''}</td>
                    <td>{d.country || ''}</td>
                    <td>{d.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
