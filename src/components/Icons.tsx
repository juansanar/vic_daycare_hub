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

// 3. Custom Municipal Glyphs (PNG icons with white backgrounds removed and tightly cropped)
export interface MuniIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
}

export function VictoriaIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/victoria.png"
      alt="Victoria Lighthouse Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function SaanichIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/saanich.png"
      alt="Saanich Sprout Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function OakBayIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/oak_bay.png"
      alt="Oak Bay Oak Leaf & Acorn Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function ViewRoyalIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/view_royal.png"
      alt="View Royal Crown & Waves Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function LangfordIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/langford.png"
      alt="Langford Hills & Pine Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function ColwoodIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/colwood.png"
      alt="Colwood Castle Turret Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function SookeIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/sooke.png"
      alt="Sooke Salmon Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function CentralSaanichIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/central_saanich.png"
      alt="Central Saanich Butterfly Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function SidneyIcon({ size = 20, className, ...props }: MuniIconProps) {
  return (
    <img
      src="/icons/sidney.png"
      alt="Sidney Sailboat Icon"
      style={{ width: size, height: size, objectFit: "contain" }}
      className={className}
      {...props}
    />
  );
}

export function EsquimaltIcon({ size = 20, className, ...props }: any) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="19" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <path d="M5 13 C5 17.5 19 17.5 19 13" />
      <line x1="5" y1="13" x2="3" y2="11" />
      <line x1="19" y1="13" x2="21" y2="11" />
    </svg>
  );
}

export function NorthSaanichIcon({ size = 20, className, ...props }: any) {
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
      <path d="M22 17H2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3Z" fill="currentColor" fillOpacity="0.1" />
      <line x1="12" y1="3" x2="12" y2="17" />
      <path d="M12 4 L19 13 H12 Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 5 L6 13 H12 Z" />
    </svg>
  );
}

export function MetchosinIcon({ size = 20, className, ...props }: any) {
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
      <path d="M2 19 Q 8 11, 14 15 T 22 11" />
      <path d="M2 19 H 22 V 15 Q 16 17, 12 13 Q 7 10, 2 19 Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M16 11 V13" />
      <circle cx="16" cy="9.5" r="2" fill="currentColor" />
    </svg>
  );
}

export function HighlandsIcon({ size = 20, className, ...props }: any) {
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
      <path d="M3 19 L10 7 L16 15 L21 10 L23 13" />
      <path d="M3 19 H22 V13 L21 10 L16 15 L10 7 Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M7 19 V15" />
      <path d="M7 12 L4 16 H10 Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M7 9 L5 13 H9 Z" />
    </svg>
  );
}

// 4. Unified Municipality Glyph switcher
interface MunicipalityGlyphProps extends MuniIconProps {
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
    case "esquimalt":
      return <EsquimaltIcon size={size} className={className} {...props} />;
    case "north saanich":
      return <NorthSaanichIcon size={size} className={className} {...props} />;
    case "metchosin":
      return <MetchosinIcon size={size} className={className} {...props} />;
    case "highlands":
      return <HighlandsIcon size={size} className={className} {...props} />;
    default:
      // Fallback sprout icon
      return <SaanichIcon size={size} className={className} {...props} />;
  }
}
