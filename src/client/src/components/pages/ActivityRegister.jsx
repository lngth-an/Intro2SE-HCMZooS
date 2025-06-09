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

const SORT_OPTIONS = [
  { id: 'eventStartAsc', label: 'Ngày diễn ra (tăng dần)' },
  { id: 'eventStartDesc', label: 'Ngày diễn ra (giảm dần)' },
  { id: 'registerStartAsc', label: 'Ngày mở đăng ký (tăng dần)' },
  { id: 'registerStartDesc', label: 'Ngày mở đăng ký (giảm dần)' },
];

function ActivityRegister() {
  const [activities, setActivities] = useState([]);
  const [domain, setDomain] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  };

  const handleCloseDetail = () => {
    setSelected(null);
    setShowDetail(false);
  };

  const filteredActivities = activities
    .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const getTime = (val) => val ? new Date(val).getTime() : 0;
      switch (sortBy) {
        case 'eventStartAsc':
          return getTime(a.eventStart) - getTime(b.eventStart);
        case 'eventStartDesc':
          return getTime(b.eventStart) - getTime(a.eventStart);
        case 'registerStartAsc':
          return getTime(a.registerStart) - getTime(b.registerStart);
        case 'registerStartDesc':
          return getTime(b.registerStart) - getTime(a.registerStart);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-md overflow-auto">
          <SidebarStudent />
        </aside>

        <main className="ml-64 flex-1 p-8 max-w-5xl mx-auto w-full">
          <h2 className="text-center text-3xl font-bold text-blue-700 mb-8">Đăng ký hoạt động</h2>

          {/* Lọc và sắp xếp */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoạt động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full"
            />
            
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full"
            >
              <option value="">Tất cả lĩnh vực</option>
              {DOMAINS.map(d => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full"
            >
              <option value="">Sắp xếp theo</option>
              {SORT_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>

            
          </div>

          {loading ? (
            <div className="text-center text-gray-600">Đang tải hoạt động...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities.length === 0 && (
                <div className="col-span-full text-center text-gray-500">Không có hoạt động phù hợp</div>
              )}
              {filteredActivities.map(a => (
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

      <footer className="mt-auto bg-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <Footer />
        </div>
      </footer>

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
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityRegister;
