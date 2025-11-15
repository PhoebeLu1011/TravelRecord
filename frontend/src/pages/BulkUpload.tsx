import { useState } from "react"
import type { FormEvent } from "react"
import { API_BASE } from "../config";

export default function BulkUpload() {
  const [bulkResp, setBulkResp] = useState("")
  const [jsonText, setJsonText] = useState("")
  const [jsonResp, setJsonResp] = useState("")

  // 上傳 CSV/JSON 檔案
  async function onSubmitBulkFile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const res = await fetch(`${API_BASE}/api/bulk`, {
      method: "POST",
      body: fd,
      credentials: "include",
    })
    const json = await res.json()
    setBulkResp(JSON.stringify(json, null, 2))
    ;(form.querySelector('input[type="file"]') as HTMLInputElement).value = ""
  }

  // 直接貼 JSON 陣列
  async function onSubmitJson(e: FormEvent) {
    e.preventDefault()
    let parsed
    try {
      parsed = JSON.parse(jsonText.trim())
    } catch {
      alert("❌ Invalid JSON format.")
      return
    }
    const res = await fetch(`${API_BASE}/api/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(parsed)
    })
    const json = await res.json()
    setJsonResp(JSON.stringify(json, null, 2))
    setJsonText("")
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* 檔案上傳 */}
      <form onSubmit={onSubmitBulkFile} className="card shadow-sm p-4" encType="multipart/form-data">
        <h5 className="mb-3 text-primary">Upload CSV / JSON</h5>
        <div className="mb-3">
          <label className="form-label">Select File</label>
          <input name="file" type="file" className="form-control" accept=".csv,.json" required />
        </div>
        <button className="btn btn-success w-100">Upload File</button>
        {bulkResp && <pre className="bg-body-tertiary p-2 mt-3 rounded small">{bulkResp}</pre>}
      </form>

      {/* 貼上 JSON */}
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
    </div>
  )
}
