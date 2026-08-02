import { useEffect } from "react";
import { useStore } from "../store";

const VARIANTS = [
  { id: "montessori", label: "Warm Montessori", emoji: "🧸", desc: "Warm organic linen, clay terracotta & sage" },
  { id: "pacific", label: "Pacific Coast", emoji: "🌲", desc: "Coastal teal, seafoam & pine accents" },
  { id: "bento", label: "Storybook Bento", emoji: "🎨", desc: "Tactile bento cards & pastel accents" },
] as const;

export default function DesignVariantSwitcher() {
  const designVariant = useStore((s) => s.designVariant);
  const setDesignVariant = useStore((s) => s.setDesignVariant);

  // Sync data-variant attribute to documentElement
  useEffect(() => {
    document.documentElement.setAttribute("data-variant", designVariant);
  }, [designVariant]);

  return (
    <div className="relative inline-flex items-center rounded-full border border-stone-200/80 bg-white/80 p-0.5 shadow-xs backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex gap-0.5">
        {VARIANTS.map((v) => {
          const isActive = designVariant === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setDesignVariant(v.id)}
              title={v.desc}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-stone-900 text-white shadow-xs dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              }`}
            >
              <span className="text-xs">{v.emoji}</span>
              <span className="hidden md:inline">{v.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
