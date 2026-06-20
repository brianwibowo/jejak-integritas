'use client';

interface PortraitBlockerProps {
  isPortrait: boolean;
  isDesktop: boolean;
}

export default function PortraitBlocker({ isPortrait, isDesktop }: PortraitBlockerProps) {
  // Don't show on desktop or when already in landscape
  if (isDesktop || !isPortrait) return null;

  return (
    <div className="portrait-blocker">
      <div className="portrait-blocker-content">
        <div className="portrait-blocker-icon">📱</div>
        <h2 className="portrait-blocker-title">Putar Layar Anda</h2>
        <p className="portrait-blocker-text">
          Game ini membutuhkan mode <strong>landscape</strong> untuk pengalaman bermain yang optimal.
        </p>
        <div className="portrait-blocker-arrow">🔄</div>
      </div>
    </div>
  );
}
