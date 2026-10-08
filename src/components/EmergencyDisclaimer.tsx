import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { AlertCircle, X } from 'lucide-react';

export const EmergencyDisclaimer: React.FC = () => {
  const { settings } = useStore();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-50/90 border-b border-amber-200/80 text-amber-900 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium text-amber-950">
            <strong>Emergency Notice:</strong> {settings.emergencyDisclaimer}
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-900 p-0.5 rounded shrink-0"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
