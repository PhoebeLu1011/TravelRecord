import { useEffect, useState } from "react";
import { API_BASE } from "../config";

type Trip = {
  _id: string;   // ← 從後端 /api/all 傳回來的
  date?: string;
  title?: string;
  city?: string;
  country?: string;
  note?: string;
};

export default function Home() {
  const [data, setData] = useState<Trip[]>([]);
  const [selected, setSelected] = useState<string[]>([]); // ← 儲存選取的 id

  // 取得全部資料
  function loadData() {
    fetch(`${API_BASE}/api/all`, { credentials: "include" })
      .then((res) => res.json())
      .then((json) => setData(Array.isArray(json) ? json : []));
  }

  useEffect(() => {
    loadData();
  }, []);

  const sorted = [...data].sort(
    (a, b) =>
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  );

  // 勾選 / 取消
  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // 一鍵刪除
  async function handleDeleteMany() {
    if (selected.length === 0) return alert("請先選取資料！");

    const res = await fetch(`${API_BASE}/api/delete_many`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: selected }),
    });

    const json = await res.json();
    console.log("delete result:", json);

    // 刪除成功 → 清空勾選 → 重新載入資料
    setSelected([]);
    loadData();
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-primary">All Travel Records</h2>

        <button
          className="btn btn-danger"
          disabled={selected.length === 0}
          onClick={handleDeleteMany}
        >
          Delete Selected ({selected.length})
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="alert alert-secondary text-center">No data yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-primary">
              <tr>
                <th>Select</th>
                <th>Date</th>
                <th>Title</th>
                <th>City</th>
                <th>Country</th>
                <th>Note</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((d) => (
                <tr key={d._id}>
                  {/* checkbox */}
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(d._id)}
                      onChange={() => toggleSelect(d._id)}
                    />
                  </td>

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
  );
}
