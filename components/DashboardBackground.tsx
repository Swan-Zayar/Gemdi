import React from 'react';

/** Fixed background: slow-rotating 3D pill shapes — no external deps */
const DashboardBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <style>{`
        @keyframes df1 {
          0%,100% { transform: perspective(1200px) rotateX(12deg) rotateY(-8deg) rotateZ(-3deg) translateY(0px); }
          33%     { transform: perspective(1200px) rotateX(18deg) rotateY(5deg)  rotateZ(1deg)  translateY(-20px); }
          66%     { transform: perspective(1200px) rotateX(7deg)  rotateY(-14deg) rotateZ(-5deg) translateY(12px); }
        }
        @keyframes df2 {
          0%,100% { transform: perspective(1200px) rotateX(-8deg) rotateY(14deg)  rotateZ(6deg)  translateY(0px); }
          50%     { transform: perspective(1200px) rotateX(4deg)  rotateY(-6deg)  rotateZ(-1deg) translateY(-28px); }
        }
        @keyframes df3 {
          0%,100% { transform: perspective(1200px) rotateX(20deg) rotateY(10deg)  rotateZ(-8deg) translateY(0px); }
          40%     { transform: perspective(1200px) rotateX(10deg) rotateY(-12deg) rotateZ(3deg)  translateY(-18px); }
          80%     { transform: perspective(1200px) rotateX(25deg) rotateY(20deg)  rotateZ(-5deg) translateY(8px); }
        }
        @keyframes df4 {
          0%,100% { transform: perspective(1200px) rotateX(-5deg)  rotateY(-10deg) rotateZ(4deg)  translateY(0px); }
          60%     { transform: perspective(1200px) rotateX(-15deg) rotateY(8deg)   rotateZ(-2deg) translateY(-22px); }
        }
        .ds1 { animation: df1 20s ease-in-out infinite; }
        .ds2 { animation: df2 26s ease-in-out infinite; }
        .ds3 { animation: df3 18s ease-in-out infinite; }
        .ds4 { animation: df4 24s ease-in-out infinite; }
        .ds5 { animation: df1 32s ease-in-out infinite reverse; }
        .ds6 { animation: df3 22s ease-in-out infinite 4s; }
      `}</style>

      {/* Pill 1 — indigo, top-left */}
      <div className="ds1 absolute" style={{ top: '7%', left: '-7%', width: 560, height: 130, borderRadius: 9999, background: 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, transparent 100%)', border: '1.5px solid rgba(99,102,241,0.11)', filter: 'blur(0.5px)' }} />
      {/* Pill 2 — blue, top-right */}
      <div className="ds2 absolute" style={{ top: '14%', right: '-4%', width: 440, height: 105, borderRadius: 9999, background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, transparent 100%)', border: '1.5px solid rgba(59,130,246,0.10)', filter: 'blur(0.5px)' }} />
      {/* Pill 3 — violet, center-left */}
      <div className="ds3 absolute" style={{ top: '44%', left: '-3%', width: 290, height: 72, borderRadius: 9999, background: 'linear-gradient(135deg, rgba(139,92,246,0.07) 0%, transparent 100%)', border: '1.5px solid rgba(139,92,246,0.09)', filter: 'blur(0.5px)' }} />
      {/* Pill 4 — cyan, bottom-right */}
      <div className="ds4 absolute" style={{ bottom: '9%', right: '-5%', width: 510, height: 122, borderRadius: 9999, background: 'linear-gradient(135deg, rgba(34,211,238,0.07) 0%, transparent 100%)', border: '1.5px solid rgba(34,211,238,0.09)', filter: 'blur(0.5px)' }} />
      {/* Pill 5 — indigo, bottom-left */}
      <div className="ds5 absolute" style={{ bottom: '17%', left: '4%', width: 210, height: 55, borderRadius: 9999, background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, transparent 100%)', border: '1.5px solid rgba(99,102,241,0.08)', filter: 'blur(0.5px)' }} />
      {/* Pill 6 — blue, center-right */}
      <div className="ds6 absolute" style={{ top: '60%', right: '2%', width: 320, height: 78, borderRadius: 9999, background: 'linear-gradient(135deg, rgba(59,130,246,0.07) 0%, transparent 100%)', border: '1.5px solid rgba(59,130,246,0.08)', filter: 'blur(0.5px)' }} />
    </div>
  );
};

export default DashboardBackground;
