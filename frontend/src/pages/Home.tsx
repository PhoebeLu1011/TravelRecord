import { useEffect, useState } from 'react'

type Trip = { date?: string; title?: string; city?: string; country?: string; note?: string }

export default function Home() {
  const [data, setData] = useState<Trip[]>([])

  useEffect(() => {
    fetch('/api/all', { credentials: "include" }
      
    )
      .then(res => res.json())
      .then(json => setData(Array.isArray(json) ? json : []))
  }, [])

  const sorted = [...data].sort((a, b) =>
    new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  )

  return (
    <div>
      <h2 className="text-primary mb-3">All Travel Records</h2>
      {sorted.length === 0 ? (
        <div className="alert alert-secondary text-center">No data yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-primary">
              <tr>
                <th>Date</th><th>Title</th><th>City</th><th>Country</th><th>Note</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => (
                <tr key={i}>
                  <td>{d.date}</td>
                  <td>{d.title}</td>
                  <td>{d.city}</td>
                  <td>{d.country}</td>
                  <td>{d.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
