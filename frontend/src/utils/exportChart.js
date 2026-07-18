import html2canvas from 'html2canvas';

/**
 * Captures a Recharts DOM wrapper by ID, applies scale factor,
 * and triggers a PNG download.
 */
export const exportChart = async (chartId, title = 'chart') => {
  const element = document.getElementById(chartId);
  if (!element) {
    console.error(`Chart container element with ID '${chartId}' not found.`);
    return false;
  }
  
  try {
    // Hide buttons during capture if they are inside the container
    const isDark = document.documentElement.classList.contains('dark');
    
    const canvas = await html2canvas(element, {
      backgroundColor: isDark ? '#1e293b' : '#ffffff', // slate-800 or white
      scale: 2, // High resolution scale factor
      logging: false,
      useCORS: true,
      onclone: (clonedDoc) => {
        // Hide the export button in the cloned document so it doesn't appear in the PNG
        const clonedBtn = clonedDoc.getElementById(`btn-export-${chartId}`);
        if (clonedBtn) {
          clonedBtn.style.display = 'none';
        }
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    
    // Format file name
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9_]+/g, '_').trim();
    
    link.download = `datalens_${cleanTitle}_${dateStr}.png`;
    link.href = imgData;
    link.click();
    return true;
  } catch (error) {
    console.error('Error rendering canvas for PNG export:', error);
    return false;
  }
};
