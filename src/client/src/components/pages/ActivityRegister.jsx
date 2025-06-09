import React, { useEffect, useState } from 'react';
import Header from '../common/Header';
import SidebarStudent from '../common/SidebarStudent';
import Footer from '../common/Footer';

const DOMAINS = [
  { id: 'academic', label: 'Học thuật' },
  { id: 'volunteer', label: 'Tình nguyện' },
  { id: 'sports', label: 'Thể thao' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'arts', label: 'Nghệ thuật' },
  { id: 'other', label: 'Khác' },
];

function ActivityRegister() {
  const [activities, setActivities] = useState([]);
  const [domain, setDomain] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ note: '' });
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState('');
  const [suggested, setSuggested] = useState([]);
  const [participationID, setParticipationID] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/participation/open${domain ? '?domain=' + domain : ''}`)
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities || []);
        setLoading(false);
      });
  }, [domain]);

  const handleShowDetail = (activity) => {
    setSelected(activity);
    setShowDetail(true);
    setShowForm(false);
    setError('');
    setSuccess('');
    setConfirm(false);
    setSuggested([]);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelected(null);
    setShowForm(false);
    setError('');
    setSuccess('');
    setConfirm(false);
    setSuggested([]);
  };

  const handleRegister = (activity) => {
    fetch(`/participation/check-eligibility/${activity.activityID}`)
      .then(res => res.json())
      .then(data => {
        if (data.eligible) {
          setShowForm(true);
          setError('');
        } else {
          setError(data.reason || 'Bạn không đủ điều kiện đăng ký hoạt động này');
          // Gợi ý hoạt động cùng lĩnh vực
          fetch(`/participation/suggest?domain=${activity.type}`)
            .then(res => res.json())
            .then(data => setSuggested(data.activities || []));
        }
      });
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    setError('');
    fetch('/participation/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityID: selected.activityID, note: form.note }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setParticipationID(data.participation.participationID);
          setConfirm(true);
        }
      });
  };

  const handleConfirm = () => {
    fetch('/participation/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participationID }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setSuccess('Đăng ký thành công! Đơn đăng ký đã gửi tới đơn vị tổ chức.');
          setShowForm(false);
          setParticipationID(null);
        }
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* SidebarStudent */}
        <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-md overflow-auto">
          <SidebarStudent />
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 max-w-5xl mx-auto w-full">
          <h2 className="text-center text-3xl font-bold text-blue-700 mb-8">Đăng ký hoạt động</h2>

          {/* Lọc lĩnh vực */}
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {DOMAINS.map(d => (
              <button
                key={d.id}
                onClick={() => setDomain(d.id)}
                className={`px-5 py-2 rounded-full border font-semibold transition ${
                  domain === d.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-100'
                }`}
              >
                {d.label}
              </button>
            ))}
            <button
              onClick={() => setDomain('')}
              className={`px-5 py-2 rounded-full border font-semibold transition ${
                !domain
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-gray-400 hover:bg-blue-100'
              }`}
            >
              Tất cả
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-600">Đang tải hoạt động...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.length === 0 && (
                <div className="col-span-full text-center text-gray-500">Không có hoạt động phù hợp</div>
              )}
              {activities.map(a => (
                <div
                  key={a.activityID}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-blue-700 font-semibold text-xl mb-2">{a.name}</h3>
                    <p className="text-gray-600 text-sm mb-1"><b>Thời gian:</b> {a.eventStart ? new Date(a.eventStart).toLocaleString() : ''}</p>
                    <p className="text-gray-600 text-sm mb-1"><b>Địa điểm:</b> {a.location}</p>
                    <p className="text-gray-600 text-sm mb-1"><b>Lĩnh vực:</b> {a.type}</p>
                  </div>
                  <button
                    onClick={() => handleShowDetail(a)}
                    className="mt-4 bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Footer />
        </div>
      </footer>

      {/* Modal chi tiết hoạt động */}
      {showDetail && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full relative overflow-auto max-h-[90vh]">
            <button
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold leading-none"
              aria-label="Đóng"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">{selected.name}</h2>
            <p className="mb-3 text-gray-700"><b>Mô tả:</b> {selected.description}</p>
            <p className="mb-2 text-gray-700">
              <b>Thời gian:</b> {selected.eventStart ? new Date(selected.eventStart).toLocaleString() : ''} - {selected.eventEnd ? new Date(selected.eventEnd).toLocaleString() : ''}
            </p>
            <p className="mb-2 text-gray-700"><b>Địa điểm:</b> {selected.location}</p>
            <p className="mb-2 text-gray-700"><b>Lĩnh vực:</b> {selected.type}</p>
            <p className="mb-2 text-gray-700"><b>Số lượng tối đa:</b> {selected.capacity || 'Không giới hạn'}</p>
            <p className="mb-2 text-gray-700"><b>Trạng thái:</b> {selected.activityStatus}</p>

            {!showForm && !success && (
              <button
                onClick={() => handleRegister(selected)}
                className="mt-6 bg-blue-600 text-white rounded-lg py-2 font-semibold w-full hover:bg-blue-700 transition"
              >
                Đăng ký
              </button>
            )}

            {showForm && (
              <form onSubmit={handleFormSubmit} className="mt-6 bg-gray-50 p-4 rounded-md">
                <label htmlFor="note" className="block font-semibold mb-2">Ghi chú (nếu có):</label>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  value={form.note}
                  onChange={handleFormChange}
                  className="w-full rounded-md border border-gray-300 p-2 mb-4"
                />

                {error && <p className="text-red-600 mb-3">{error}</p>}

                {!confirm && (
                  <button
                    type="submit"
                    className="bg-green-600 text-white rounded-lg py-2 font-semibold w-full hover:bg-green-700 transition"
                  >
                    Gửi đăng ký
                  </button>
                )}
                {confirm && (
                  <>
                    <p className="mb-3 text-green-700 font-semibold">Bạn có chắc chắn muốn xác nhận đăng ký này không?</p>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      className="bg-blue-600 text-white rounded-lg py-2 font-semibold w-full hover:bg-blue-700 transition"
                    >
                      Xác nhận đăng ký
                    </button>
                  </>
                )}
              </form>
            )}

            {success && (
              <p className="mt-6 text-green-700 font-semibold text-center">{success}</p>
            )}

            {error && !showForm && <p className="mt-4 text-red-600 font-semibold">{error}</p>}

            {/* Gợi ý hoạt động khác nếu có */}
            {suggested.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-700">Hoạt động đề xuất cùng lĩnh vực</h3>
                <ul className="list-disc pl-5 space-y-2 max-h-40 overflow-auto">
                  {suggested.map(act => (
                    <li key={act.activityID}>
                      <button
                        className="text-blue-600 underline hover:text-blue-800"
                        onClick={() => {
                          setSelected(act);
                          setShowForm(false);
                          setError('');
                          setSuccess('');
                          setConfirm(false);
                          setSuggested([]);
                        }}
                      >
                        {act.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityRegister;
