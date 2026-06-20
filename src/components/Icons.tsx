import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// 1. The Garry Oak Leaf & Sprout Icon (Green leaf with a smiling acorn)
export function GarryOakIcon({ size = 48, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Garry Oak Leaf (Emerald/Green) */}
      <path
        d="M48 68 C40 68 30 60 30 52 C30 48 35 46 32 40 C29 34 35 30 34 22 C33 16 42 12 48 12 C54 12 63 16 62 22 C61 30 67 34 64 40 C61 46 66 48 66 52 C66 60 56 68 48 68 Z"
        fill="#10B981"
        stroke="#047857"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Leaf stem line */}
      <path d="M48 68 C48 60 48 20 48 14" stroke="#047857" strokeWidth="2" strokeDasharray="2 3" />
      
      {/* Acorn (Brown) */}
      {/* Cap */}
      <path d="M56 52 C56 47 74 47 74 52 Z" fill="#B45309" stroke="#78350F" strokeWidth="2.5" />
      {/* Nut */}
      <path d="M57 52 C57 65 73 65 73 52 Z" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
      
      {/* Sprout */}
      <path d="M65 48 C65 40 68 36 72 32" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
      <path d="M72 32 C68 28 70 24 75 25 C75 28 73 31 72 32 Z" fill="#34D399" stroke="#047857" strokeWidth="2" />
      <path d="M72 32 C76 30 79 32 78 37 C75 37 73 34 72 32 Z" fill="#34D399" stroke="#047857" strokeWidth="2" />

      {/* Smiling Face */}
      <g fill="#78350F">
        <circle cx="62" cy="56" r="1.8" />
        <circle cx="68" cy="56" r="1.8" />
        <path
          d="M62 59.5 C63.5 61.5 66.5 61.5 68 59.5"
          stroke="#78350F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

// 2. Full Garry Oak Logo with text
export function GarryOakLogo({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <GarryOakIcon size={size} />
      <div className="flex flex-col text-left">
        <span className="text-xl font-bold tracking-tight text-emerald-800 leading-none">
          Victoria Childcare Hub
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mt-0.5">
          Community Care Finder
        </span>
      </div>
    </div>
  );
}

// 3. The Camas Flower Icon (Lotus-like purple petals with a smiling sun in the center)
export function CamasIcon({ size = 48, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Petals (Camas purple color) */}
      <g stroke="#8B5CF6" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Central vertical petal */}
        <path d="M50 12 C55 28 64 36 65 52 C57 56 43 56 35 52 C36 36 45 28 50 12 Z" fill="#EEF2FF" />
        
        {/* Left top petal */}
        <path d="M50 52 C34 44 26 28 12 36 C10 46 22 56 35 52" fill="none" />
        <path d="M50 52 C34 44 26 28 12 36 C10 46 20 54 35 52" fill="#EEF2FF" />
        
        {/* Right top petal */}
        <path d="M50 52 C66 44 74 28 88 36 C90 46 80 54 65 52" fill="#EEF2FF" />
        
        {/* Left bottom petal */}
        <path d="M35 52 C22 56 12 68 20 80 C32 84 42 70 50 62" fill="#EEF2FF" />
        
        {/* Right bottom petal */}
        <path d="M65 52 C78 56 88 68 80 80 C68 84 58 70 50 62" fill="#EEF2FF" />
      </g>

      {/* Sun Center (Yellow/Amber) */}
      <circle cx="50" cy="54" r="14" fill="#F59E0B" stroke="#D97706" strokeWidth="3" />
      
      {/* Sun Rays */}
      <g stroke="#D97706" strokeWidth="2.5" strokeLinecap="round">
        <path d="M50 35 V38" />
        <path d="M50 70 V73" />
        <path d="M31 54 H34" />
        <path d="M66 54 H69" />
        <path d="M37 41 L39 43" />
        <path d="M63 41 L61 43" />
        <path d="M37 67 L39 65" />
        <path d="M63 67 L61 65" />
      </g>

      {/* Smiling Face */}
      <g fill="#78350F">
        {/* Eyes */}
        <circle cx="45.5" cy="52.5" r="1.8" />
        <circle cx="54.5" cy="52.5" r="1.8" />
        {/* Smile */}
        <path d="M44.5 57.5 C46.5 60.5 53.5 60.5 55.5 57.5" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

// 2. Full Camas Logo with text
export function CamasLogo({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CamasIcon size={size} />
      <div className="flex flex-col text-left">
        <span className="text-xl font-bold tracking-tight text-indigo-900 leading-none">
          Victoria Childcare Hub
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-600 mt-0.5">
          Community Care Finder
        </span>
      </div>
    </div>
  );
}

// 3. Custom Municipal Glyphs (designed with stroke for standard size and customization)
export function VictoriaIcon({ size = 20, className, ...props }: IconProps) {
  // Heritage Lighthouse / Harbour Light
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Water line */}
      <path d="M2 22h20" />
      {/* Lighthouse tower */}
      <path d="M8 22l2-12h4l2 12" />
      {/* Light cabin */}
      <path d="M10 10h4V7h-4z" />
      {/* Dome */}
      <path d="M12 7c-1.5 0-2-1-2-1h4s-.5 1-2 1z" />
      {/* Light beams */}
      <path d="M6 8L3 9" opacity="0.6" />
      <path d="M18 8l3 9" opacity="0.6" />
      <path d="M5 12l-3-1" opacity="0.6" />
      <path d="M19 12l3 1" opacity="0.6" />
    </svg>
  );
}

export function SaanichIcon({ size = 20, className, ...props }: IconProps) {
  // Sprout / Agriculture & Parks (rural roots)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 22C12 17 14 12 20 8" />
      <path d="M20 8c-3-2-7 0-8 4-1-4-5-6-8-4 0 4 3 8 8 8" />
      <path d="M12 12c-1-3-4-4-6-3" />
    </svg>
  );
}

export function OakBayIcon({ size = 20, className, ...props }: IconProps) {
  // Oak leaf and acorn
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Oak leaf lobe paths */}
      <path d="M12 2v20" />
      <path d="M12 4c-3 1-5 3-4 6 1 1-1 3-3 3s-2 2-2 4 3 3 6 1" />
      <path d="M12 4c3 1 5 3 4 6-1 1 1 3 3 3s2 2 2 4-3 3-6 1" />
      {/* Acorn hanging off the stem */}
      <path d="M9 18a3 3 0 0 0 6 0" fill="currentColor" fillOpacity="0.2" />
      <path d="M8.5 16.5h7" />
    </svg>
  );
}

export function ViewRoyalIcon({ size = 20, className, ...props }: IconProps) {
  // Royal crown and coastal ocean waves
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Crown */}
      <path d="M4 14l2-8 4 4 2-5 2 5 4-4 2 8H4z" fill="currentColor" fillOpacity="0.1" />
      {/* Waves */}
      <path d="M2 18c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
      <path d="M2 21c2-1 4-1 6 0s4 1 6 0 4-1 6 0" opacity="0.6" />
    </svg>
  );
}

export function LangfordIcon({ size = 20, className, ...props }: IconProps) {
  // Rolling hills and outdoor recreational pine trees
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Hills */}
      <path d="M2 20c4-3 7-3 11-1s6 2 9 0" />
      <path d="M10 18c3-4 6-4 9-2" opacity="0.8" />
      {/* Pine tree on hill */}
      <path d="M6 16l3-5h-2l2.5-4 2.5 4h-2l3 5H6z" fill="currentColor" fillOpacity="0.1" />
      <path d="M8.5 16v3" />
    </svg>
  );
}

export function ColwoodIcon({ size = 20, className, ...props }: IconProps) {
  // Castle Turret (Hatley Castle)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Castle turret base & walls */}
      <path d="M6 22V9l-1-2V4h14v3l-1 2v13" fill="currentColor" fillOpacity="0.1" />
      {/* Crenellations */}
      <path d="M5 4h2v2h3V4h2v2h3V4h2v2h2" />
      {/* Window */}
      <rect x="10" y="8" width="4" height="5" rx="1" />
      {/* Gate */}
      <path d="M9 22v-4a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

export function SookeIcon({ size = 20, className, ...props }: IconProps) {
  // Wild coast salmon jumping
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Water splash splash */}
      <path d="M2 19c3-1 6 1 9 1s6-2 11-1" />
      {/* Jumping Salmon */}
      <path d="M4 14c2-5 7-8 12-6 2.5 1 4.5 3.5 5 6-.5 0-3-.5-5-1-1.5 2-4 3.5-7 3.5-2.5 0-4.5-.5-5-2.5" fill="currentColor" fillOpacity="0.1" />
      {/* Fin */}
      <path d="M11 8l2 2" />
      <path d="M12 15l-1 2" />
      {/* Tail */}
      <path d="M3 13l-2-2 1.5 3-1 2.5 2.5-1.5z" />
    </svg>
  );
}

export function CentralSaanichIcon({ size = 20, className, ...props }: IconProps) {
  // Garden Butterfly (Butchart Gardens)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Butterfly body */}
      <line x1="12" y1="5" x2="12" y2="19" />
      <circle cx="12" cy="4" r="1.5" />
      {/* Left Wings */}
      <path d="M12 8C8 3 3 5 3 10c0 4 4 3 9 5" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 14c-4 0-7 2-7 5s3 3 7-1" fill="currentColor" fillOpacity="0.05" />
      {/* Right Wings */}
      <path d="M12 8c4-5 9-3 9 2 0 4-4 3-9 5" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 14c4 0 7 2 7 5s-3 3-7-1" fill="currentColor" fillOpacity="0.05" />
    </svg>
  );
}

export function SidneyIcon({ size = 20, className, ...props }: IconProps) {
  // Sailboat (Sidney-by-the-Sea)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Waves */}
      <path d="M2 20c3.5-1 6.5 1 10 0s6.5-1 10 0" />
      {/* Hull */}
      <path d="M4 17l2 3h12l2-3H4z" fill="currentColor" fillOpacity="0.2" />
      {/* Mast */}
      <line x1="12" y1="4" x2="12" y2="17" />
      {/* Main Sail */}
      <path d="M12 5l6 8H12V5z" fill="currentColor" fillOpacity="0.1" />
      {/* Jib Sail */}
      <path d="M12 6L7 13h5V6z" />
    </svg>
  );
}

// 4. Unified Municipality Glyph switcher
interface MunicipalityGlyphProps extends IconProps {
  municipality: string;
}

export function MunicipalityGlyph({ municipality, size = 18, className, ...props }: MunicipalityGlyphProps) {
  const normalized = municipality.trim().toLowerCase();

  switch (normalized) {
    case "victoria":
      return <VictoriaIcon size={size} className={className} {...props} />;
    case "saanich":
      return <SaanichIcon size={size} className={className} {...props} />;
    case "oak bay":
      return <OakBayIcon size={size} className={className} {...props} />;
    case "view royal":
      return <ViewRoyalIcon size={size} className={className} {...props} />;
    case "langford":
      return <LangfordIcon size={size} className={className} {...props} />;
    case "colwood":
      return <ColwoodIcon size={size} className={className} {...props} />;
    case "sooke":
      return <SookeIcon size={size} className={className} {...props} />;
    case "central saanich":
      return <CentralSaanichIcon size={size} className={className} {...props} />;
    case "sidney":
      return <SidneyIcon size={size} className={className} {...props} />;
    default:
      // Fallback sprout icon
      return <SaanichIcon size={size} className={className} {...props} />;
  }
}
