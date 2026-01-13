import React, { useState } from 'react';

import { useCanvas } from '../../../context/CanvasContext';

import { LinkedInPublishModal } from '../LinkedInPublishModal';

const ExportPanel: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { canvasRef } = useCanvas();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fitMode, setFitMode] = useState('cover');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [exportFormat, setExportFormat] = useState('png');
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);

  return (
    <div className='bg-zinc-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl flex flex-col justify-center items-center text-center relative group'>
      <LinkedInPublishModal isOpen={showLinkedInModal} onClose={() => setShowLinkedInModal(false)} />
      {/* ... (rest of the panel content unchanged) */}
      <div className='relative z-10 w-full'>
        {/* ... (Header, Platform, Fit, Format unchanged) */}
        
        {/* Export actions moved to bottom nav */}
      </div>
    </div>
  );
};

export default ExportPanel;
