import { useState } from "react"
import type { FormEvent } from "react"
import { API_BASE } from "../config";

type Trip = {
  date?: string
  title?: string
  city?: string
  country?: string
  note?: string     
}

export default function AddRecord() {
  const [single, setSingle] = useState<Trip>({})
  const [resp, setResp] = useState("")

  async function onSubmitSingle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const res = await fetch(`${API_BASE}/api/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(single),
    })
    const json = await res.json()
    setResp(JSON.stringify(json, null, 2))
    setSingle({})
  }


  return (
    <form onSubmit={onSubmitSingle} className="card shadow-sm p-4" encType="multipart/form-data">
      <h5 className="mb-3 text-primary">Add Single Record</h5>

      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          className="form-control"
          placeholder="e.g., Kyoto Trip"
          value={single.title || ""}
          onChange={e => setSingle(s => ({ ...s, title: e.target.value }))}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Date</label>
        <input
          type="date"
          className="form-control"
          value={single.date || ""}
          onChange={e => setSingle(s => ({ ...s, date: e.target.value }))}
        />
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">City</label>
          <input
            className="form-control"
            placeholder="Kyoto"
            value={single.city || ""}
            onChange={e => setSingle(s => ({ ...s, city: e.target.value }))}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Country</label>
          <input
            className="form-control"
            placeholder="Japan"
            value={single.country || ""}
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
          value={single.note || ""}
          onChange={e => setSingle(s => ({ ...s, note: e.target.value }))}
        />
      </div>

      <button className="btn btn-primary w-100">Submit Record</button>
      {resp && <pre className="bg-body-tertiary p-2 mt-3 rounded small">{resp}</pre>}
    </form>
  )
}
