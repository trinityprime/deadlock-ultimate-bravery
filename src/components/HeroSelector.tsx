import React from "react";

type Hero = { id?: string; name?: string; displayName?: string; img?: string };

export default function HeroSelector({
  heroes,
  value,
  onChange,
}: {
  heroes: Hero[];
  value: string;
  onChange: (h: string) => void;
}) {
  return (
    <div className="hero-selector">
      <label>
        Select Hero:
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {heroes.map((h) => {
            const label = h.displayName || h.name || h.id || "Unknown";
            const id = h.id || label;
            return (
              <option key={id} value={id}>
                {label}
              </option>
            );
          })}
        </select>
      </label>
    </div>
  );
}
