import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { api } from '../services/api';

export const useUpload = () => {
  const { setSessionId, setUploadedFile } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);

    // Client-side validations
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isCsv = file.name.endsWith('.csv');
    if (!isCsv && !isExcel) {
      setError('Only CSV and XLSX files are supported.');
      setIsLoading(false);
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      setIsLoading(false);
      return null;
    }

    try {
      const data = await api.uploadFile(file);
      
      // Update global context states
      setSessionId(data.session_id);
      setUploadedFile({
        filename: data.filename,
        rowCount: data.row_count,
        columnCount: data.column_count,
        columns: data.columns,
        cleaningReport: data.cleaning_report,
        preview: data.preview,
      });

      setIsLoading(false);
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to upload and clean the file. Ensure it is not corrupted.';
      setError(msg);
      setIsLoading(false);
      return null;
    }
  };

  return {
    handleUpload,
    isLoading,
    error,
    setError,
  };
};
