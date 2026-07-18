import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUpload } from '../../hooks/useUpload';

const UploadZone = () => {
  const { handleUpload, isLoading, error, setError } = useUpload();
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setSelectedFile(file);
    await handleUpload(file);
  }, [handleUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    }
  });

  return (
    <div className="w-full flex flex-col items-center">
      {/* Title block */}
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
          Analytics, Powered by AI.
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
          Drop your CSV or Excel sales spreadsheet. Get automatic cleaning profiles, key charts, and ask question Q&As instantly.
        </p>
      </div>

      {/* Drag & drop box */}
      <div
        {...getRootProps()}
        className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-10 md:p-14 text-center cursor-pointer transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-950/20 shadow-2xl shadow-indigo-500/10 scale-[1.02]'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-6">
            {/* Spinning load state */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-950/80"></div>
              <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-1.5">
              <p className="text-slate-200 font-semibold text-lg animate-pulse">
                Parsing dataset...
              </p>
              <p className="text-slate-400 text-xs font-light">
                {selectedFile ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'Uploading'}
              </p>
              <p className="text-slate-400 text-[11px] font-light max-w-xs mx-auto">
                Running data cleaning, column type resolution, and RAG semantic indexing.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 dark:bg-slate-800/40 flex items-center justify-center border border-slate-700/60 shadow-inner group-hover:scale-110 transition duration-300">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-slate-200 text-xl font-bold">
                {isDragActive ? 'Drop your data file here' : 'Drag & drop file here'}
              </p>
              <p className="text-slate-400 text-sm">
                or <span className="text-indigo-400 font-semibold underline decoration-2 underline-offset-2 hover:text-indigo-300">browse local files</span>
              </p>
            </div>

            <div className="pt-2 flex justify-center items-center space-x-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>CSV or XLSX</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span>Less than 10MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Error block */}
      {error && (
        <div className="mt-6 w-full max-w-2xl bg-rose-950/20 border border-rose-900/60 px-5 py-4 rounded-2xl flex items-start space-x-3 text-rose-300">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-bold">Upload Failed</p>
            <p className="text-xs text-rose-300/80 leading-normal">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
