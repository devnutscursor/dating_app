import { useState } from 'react';
import { Flag, Check, X, MessageSquare, AlertTriangle, UserX, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reports = [
  { 
    id: 1, 
    reporter: 'John D.', 
    reported: 'Sarah M.', 
    type: 'harassment', 
    topic: 'Inappropriate messages',
    status: 'pending',
    date: '2 hours ago' 
  },
  { 
    id: 2, 
    reporter: 'Emma W.', 
    reported: 'Mike R.', 
    type: 'profile', 
    topic: 'Fake profile',
    status: 'reviewing',
    date: '5 hours ago' 
  },
  { 
    id: 3, 
    reporter: 'Tom H.', 
    reported: 'Lisa K.', 
    type: 'financial', 
    topic: 'Payment dispute',
    status: 'pending',
    date: '1 day ago' 
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'financial': return 'bg-red-100 text-red-700';
    case 'profile': return 'bg-blue-100 text-blue-700';
    case 'harassment': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'reviewing': return 'bg-blue-100 text-blue-700';
    case 'resolved': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function AdminReports() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved'>('all');

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Manage user reports and disputes</p>
        </div>
        <div className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg">
          <Flag className="w-4 h-4" />
          <span className="font-medium">{reports.filter(r => r.status === 'pending').length} pending</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'reviewing', 'resolved'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === status ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                      {report.type}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className="text-sm text-gray-400">{report.date}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{report.topic}</h3>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Reported by:</span>
                      <span className="font-medium text-gray-900">{report.reporter}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">User:</span>
                      <span className="font-medium text-gray-900">{report.reported}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <UserX className="w-4 h-4 text-red-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="bg-green-500 hover:bg-green-600 gap-1">
                  <Check className="w-4 h-4" />
                  Resolve
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Escalate
                </Button>
                <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 gap-1">
                  <X className="w-4 h-4" />
                  Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
