"use client";

/* ─── Microscope SVG ─────────────────────────────────────────────────── */
function MicroscopeSVG() {
  return (
    <svg width="56" height="80" viewBox="0 0 56 80" fill="none" aria-label="Kính hiển vi">
      {/* Base */}
      <rect x="8" y="68" width="40" height="8" rx="4" fill="#546E7A" />
      <rect x="14" y="64" width="28" height="6" rx="2" fill="#607D8B" />
      {/* Arm column */}
      <rect x="24" y="22" width="8" height="44" rx="3" fill="#78909C" />
      {/* Arm horizontal */}
      <rect x="18" y="20" width="20" height="6" rx="2" fill="#607D8B" />
      {/* Stage platform */}
      <rect x="10" y="46" width="36" height="5" rx="2" fill="#90A4AE" />
      {/* Stage clips */}
      <rect x="14" y="44" width="6" height="3" rx="1" fill="#78909C" />
      <rect x="36" y="44" width="6" height="3" rx="1" fill="#78909C" />
      {/* Coarse adjustment knob */}
      <ellipse cx="22" cy="50" rx="5" ry="6" fill="#546E7A" />
      <ellipse cx="22" cy="50" rx="3" ry="4" fill="#607D8B" />
      {/* Fine knob */}
      <ellipse cx="22" cy="40" rx="4" ry="5" fill="#546E7A" />
      {/* Objective turret */}
      <ellipse cx="28" cy="22" rx="10" ry="5" fill="#607D8B" />
      {/* Objectives */}
      <rect x="26" y="10" width="4" height="14" rx="2" fill="#455A64" />
      <rect x="33" y="13" width="3" height="10" rx="1.5" fill="#455A64" />
      <rect x="20" y="13" width="3" height="10" rx="1.5" fill="#455A64" />
      {/* Eyepiece */}
      <rect x="25" y="2" width="6" height="10" rx="3" fill="#37474F" />
      <ellipse cx="28" cy="2" rx="3.5" ry="2" fill="#263238" />
      {/* Eyepiece lens glint */}
      <ellipse cx="27" cy="2" rx="1" ry="0.8" fill="rgba(255,255,255,0.5)" />
      {/* Light source / condenser */}
      <rect x="25" y="50" width="6" height="14" rx="2" fill="#546E7A" />
      <ellipse cx="28" cy="64" rx="4" ry="2" fill="#78909C" />
      {/* Mirror / light */}
      <ellipse cx="28" cy="64" rx="2.5" ry="1.2" fill="rgba(200,240,255,0.7)" />
    </svg>
  );
}

/* ─── Bunsen Burner SVG ──────────────────────────────────────────────── */
function BunsenBurnerSVG() {
  return (
    <svg width="40" height="72" viewBox="0 0 40 72" fill="none" aria-label="Đèn Bunsen">
      {/* Base */}
      <rect x="4" y="62" width="32" height="8" rx="4" fill="#546E7A" />
      {/* Barrel body */}
      <rect x="14" y="28" width="12" height="36" rx="4" fill="#78909C" />
      {/* Air intake hole */}
      <rect x="16" y="48" width="8" height="4" rx="1" fill="#455A64" />
      {/* Barrel top collar */}
      <rect x="12" y="26" width="16" height="5" rx="2" fill="#607D8B" />
      {/* Top opening */}
      <ellipse cx="20" cy="26" rx="7" ry="2.5" fill="#546E7A" />
      <ellipse cx="20" cy="26" rx="4" ry="1.5" fill="#37474F" />
      {/* Gas supply tube */}
      <rect x="17" y="60" width="6" height="6" rx="1" fill="#455A64" />
      {/* Needle valve */}
      <rect x="28" y="54" width="8" height="4" rx="2" fill="#607D8B" />
      <circle cx="32" cy="56" r="3" fill="#546E7A" />

      {/* FLAME — animated via CSS .flame-animate class */}
      <g className="flame-animate" style={{ transformOrigin: "20px 26px" }}>
        {/* Outer flame — blue */}
        <path
          d="M13 26 Q10 12 20 4 Q30 12 27 26 Z"
          fill="#42A5F5"
          opacity="0.85"
        />
        {/* Mid flame — cyan */}
        <path
          d="M15 26 Q13 16 20 8 Q27 16 25 26 Z"
          fill="#00BCD4"
          opacity="0.9"
        />
        {/* Inner flame — white-blue core */}
        <path
          d="M17 26 Q16 20 20 14 Q24 20 23 26 Z"
          fill="#E1F5FE"
          opacity="0.95"
        />
        {/* Tiny inner core */}
        <path
          d="M18.5 26 Q18 22 20 18 Q22 22 21.5 26 Z"
          fill="white"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}

/* ─── Test Tube Rack SVG ─────────────────────────────────────────────── */
const TUBE_COLORS = ["#FF6B6B", "#4FC3F7", "#A5D6A7", "#FFF176", "#CE93D8", "#FFB74D"];

function TestTubeRackSVG() {
  return (
    <svg width="72" height="60" viewBox="0 0 72 60" fill="none" aria-label="Giá ống nghiệm">
      {/* Rack base */}
      <rect x="2" y="48" width="68" height="8" rx="4" fill="#8D6E63" />
      {/* Rack top bar */}
      <rect x="2" y="14" width="68" height="6" rx="3" fill="#A1887F" />
      {/* Vertical supports */}
      <rect x="4" y="14" width="5" height="42" rx="2" fill="#8D6E63" />
      <rect x="63" y="14" width="5" height="42" rx="2" fill="#8D6E63" />

      {/* 6 test tubes */}
      {TUBE_COLORS.map((color, i) => {
        const x = 12 + i * 10;
        return (
          <g key={i}>
            {/* Tube body */}
            <path
              d={`M${x + 1} 14 L${x + 1} 44 Q${x + 1} 50 ${x + 4} 50 Q${x + 7} 50 ${x + 7} 44 L${x + 7} 14 Z`}
              fill="rgba(200,230,255,0.25)"
              stroke="rgba(120,160,200,0.35)"
              strokeWidth="0.6"
            />
            {/* Liquid */}
            <clipPath id={`tc-${i}`}>
              <path d={`M${x + 2} 32 L${x + 2} 44 Q${x + 2} 49 ${x + 4} 49 Q${x + 6} 49 ${x + 6} 44 L${x + 6} 32 Z`} />
            </clipPath>
            <g clipPath={`url(#tc-${i})`}>
              <rect x={x + 1} y={30} width={7} height={22} fill={color} opacity="0.85" />
            </g>
            {/* Glass highlight */}
            <line
              x1={x + 2.5} y1={16} x2={x + 2.5} y2={42}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Graduated Cylinder SVG ────────────────────────────────────────── */
function GraduatedCylinderSVG() {
  return (
    <svg width="28" height="72" viewBox="0 0 28 72" fill="none" aria-label="Ống đong">
      {/* Base */}
      <rect x="2" y="64" width="24" height="6" rx="3" fill="#90A4AE" />
      {/* Body */}
      <path
        d="M6 10 L4 64 L24 64 L22 10 Z"
        fill="rgba(200,230,255,0.2)"
        stroke="rgba(120,160,200,0.4)"
        strokeWidth="0.8"
      />
      {/* Graduation marks */}
      {[15, 25, 35, 45, 55].map((y) => (
        <line
          key={y}
          x1="8" y1={y} x2="14" y2={y}
          stroke="rgba(100,140,180,0.4)"
          strokeWidth="0.8"
        />
      ))}
      {/* Liquid */}
      <clipPath id="cyl-clip">
        <path d="M7 40 L5 63 L23 63 L21 40 Z" />
      </clipPath>
      <g clipPath="url(#cyl-clip)">
        <rect x="4" y="38" width="20" height="28" fill="rgba(76,175,80,0.5)" />
        <ellipse cx="14" cy="40" rx="8" ry="1.5" fill="rgba(255,255,255,0.25)" />
      </g>
      {/* Pour spout */}
      <path
        d="M20 8 L26 4"
        stroke="rgba(120,160,200,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Rim */}
      <rect x="5" y="8" width="18" height="3" rx="1.5" fill="#90A4AE" />
      {/* Glass highlight */}
      <line
        x1="8" y1="12" x2="7" y2="60"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */

export function LabEquipment2D({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-end gap-4 ${className ?? ""}`}
      aria-label="Thiết bị phòng thí nghiệm"
    >
      {/* Microscope — left side */}
      <div className="relative" style={{ zIndex: 6 }}>
        <MicroscopeSVG />
      </div>

      {/* Graduated cylinder */}
      <div className="relative" style={{ zIndex: 6, marginBottom: 4 }}>
        <GraduatedCylinderSVG />
      </div>

      {/* Test tube rack — center */}
      <div className="relative" style={{ zIndex: 6, marginBottom: 8 }}>
        <TestTubeRackSVG />
      </div>

      {/* Bunsen burner — right side */}
      <div className="relative" style={{ zIndex: 6 }}>
        <BunsenBurnerSVG />
      </div>
    </div>
  );
}
