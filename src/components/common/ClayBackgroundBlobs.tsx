import React from 'react';

/**
 * High-Fidelity Claymorphism Background Blobs
 * Renders floating, high-blur multi-chromatic ambient orbs
 * creating the soft, physical zero-gravity environment behind glass-clay cards.
 */
export const ClayBackgroundBlobs: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 select-none" aria-hidden="true">
      {/* Top Left Violet Orb */}
      <div
        className="absolute -top-[12%] -left-[10%] h-[55vh] w-[55vh] rounded-full blur-3xl opacity-35 animate-clay-float"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, rgba(167, 139, 250, 0.15) 70%, transparent 100%)',
        }}
      />

      {/* Top Right Pink Orb */}
      <div
        className="absolute -right-[12%] top-[10%] h-[60vh] w-[60vh] rounded-full blur-3xl opacity-30 animate-clay-float-delayed"
        style={{
          background: 'radial-gradient(circle, rgba(219, 39, 119, 0.4) 0%, rgba(244, 114, 182, 0.15) 70%, transparent 100%)',
        }}
      />

      {/* Center Left Sky Blue Orb */}
      <div
        className="absolute -left-[8%] top-[45%] h-[50vh] w-[50vh] rounded-full blur-3xl opacity-25 animate-clay-float-slow"
        style={{
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, rgba(56, 189, 248, 0.1) 70%, transparent 100%)',
        }}
      />

      {/* Bottom Amber/Emerald Warm Orb */}
      <div
        className="absolute -right-[10%] -bottom-[15%] h-[65vh] w-[65vh] rounded-full blur-3xl opacity-25 animate-clay-breathe"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(245, 158, 11, 0.15) 70%, transparent 100%)',
        }}
      />
    </div>
  );
};
