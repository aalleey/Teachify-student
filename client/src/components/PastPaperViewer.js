import React, { useState } from 'react';

const PastPaperViewer = ({ paper, onClose }) => {
  const [loading, setLoading] = useState(true);

  // Get file URL - handle both local and absolute URLs
  const getFileUrl = () => {
    if (!paper?.fileUrl) return '';
    
    // If it's already a full URL, return as is
    if (paper.fileUrl.startsWith('http://') || paper.fileUrl.startsWith('https://')) {
      return paper.fileUrl;
    }
    
    // For local files, construct the full URL
    const baseURL = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:5000';
    
    return `${baseURL}${paper.fileUrl}`;
  };

  const fileUrl = getFileUrl();
  const isPdf = paper?.fileType === 'application/pdf' || paper?.fileUrl?.endsWith('.pdf');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d0d0d] rounded-xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">{paper?.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="font-semibold text-primary-400">{paper?.subject}</span>
              <span>•</span>
              <span>Year: {paper?.year}</span>
              {paper?.uploadedBy && (
                <>
                  <span>•</span>
                  <span>Uploaded by: {paper.uploadedBy.name}</span>
                </>
              )}
              {paper?.createdAt && (
                <>
                  <span>•</span>
                  <span>{formatDate(paper.createdAt)}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0d]">
              <div className="text-white text-lg">Loading paper...</div>
            </div>
          )}

          {isPdf ? (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              title={paper?.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0d0d0d]">
              <img
                src={fileUrl}
                alt={paper?.title}
                onLoad={() => setLoading(false)}
                className="max-w-full max-h-full object-contain"
                onError={() => setLoading(false)}
              />
            </div>
          )}

          {/* Error Message */}
          {!loading && !fileUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0d]">
              <div className="text-red-400 text-lg">Failed to load paper</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-[#0d0d0d]">
          <div className="text-sm text-gray-400">
            {paper?.description && (
              <p className="text-gray-300">{paper.description}</p>
            )}
          </div>
          <div className="text-xs text-gray-500">
            View only - Download disabled
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastPaperViewer;

