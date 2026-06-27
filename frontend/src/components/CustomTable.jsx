import React from 'react';

const CustomTable = ({ 
  columns, 
  data = [], 
  loading = false, 
  pagination = null, 
  emptyMessage = 'No records found' 
}) => {
  return (
    <div className="w-full flex flex-col">
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/30">
        <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-300">
          <thead className="bg-slate-900/70 text-slate-400 uppercase font-semibold text-xs tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  scope="col" 
                  className={`px-6 py-4 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-transparent">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-6 h-6 border-t-2 border-b-2 rounded-full border-steel-400 animate-spin"></div>
                    <span className="text-slate-400">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className="hover:bg-slate-800/25 transition-colors duration-150"
                >
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`px-6 py-4 whitespace-nowrap align-middle ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border border-slate-800 bg-slate-900/20 rounded-xl mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={pagination.onPrev}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-slate-800 text-xs font-semibold rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={pagination.onNext}
              disabled={pagination.currentPage === pagination.totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-slate-800 text-xs font-semibold rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-400">
                Showing page <span className="font-semibold text-white">{pagination.currentPage}</span> of{' '}
                <span className="font-semibold text-white">{pagination.totalPages || 1}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px gap-2" aria-label="Pagination">
                <button
                  onClick={pagination.onPrev}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-3 py-1.5 border border-slate-800 text-xs font-semibold rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={pagination.onNext}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-3 py-1.5 border border-slate-800 text-xs font-semibold rounded-lg bg-slate-900 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
