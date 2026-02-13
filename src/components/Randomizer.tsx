import React, { useState, useEffect } from "react";

type Item = any;

function itemName(it: Item) {
  return it.displayName || it.name || it.title || `Item ${it.id ?? "?"}`;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/'s\b/g, "")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getImageUrl(it: Item) {
  const provided = it.image_webp || it.image;
  if (provided) return provided;
  const slot = (it.slot as string) || "weapon";
  const name = (it.name || it.displayName || it.title || "").toString();
  if (!name) return "";
  let slug = slugify(name);
  if (slug === "spellslinger") slug = "spell_slinger";
  return `https://assets-bucket.deadlock-api.com/assets-api-res/images/items/${slot}/${slug}_sm.png`;
}

export default function Randomizer({
  items,
  hero,
  heroObj,
  selectedHeroPool,
  onHeroChange,
}: {
  items: Item[];
  hero: string;
  heroObj?: any;
  selectedHeroPool: Set<string>;
  heroes: any[];
  onHeroChange: (heroId: string) => void;
}) {
  const [result, setResult] = useState<Item[]>([]);

  useEffect(() => {
    chooseRandom();
  }, []);

  function chooseRandom() {
    if (!items || items.length === 0) return;
    if (selectedHeroPool.size === 0) {
      alert("Please select at least one hero from the pool!");
      return;
    }

    const heroArray = Array.from(selectedHeroPool);
    const heroIndex = Math.floor(Math.random() * heroArray.length);
    onHeroChange(heroArray[heroIndex]);

    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // We take 12 items total: 0-8 are regular, 9-11 are locked
    setResult(pool.slice(0, 12));
  }

  function copyLink() {
    const url = new URL(window.location.href);
    url.searchParams.set("hero", hero);
    try {
      navigator.clipboard.writeText(url.toString());
      alert("Link copied!");
    } catch {
      prompt("Copy this link:", url.toString());
    }
  }

  return (
    <div className="randomizer">
      <div className="randomizer-header">
        <button onClick={chooseRandom} className="btn-randomize">
          Randomize
        </button>
        <button onClick={copyLink} className="btn-copy">
          Copy Link
        </button>
      </div>

      {result.length > 0 && (
        <div className="hero-display">
          {heroObj?.img ? (
            <img
              src={heroObj.img}
              alt={heroObj.name}
              className="hero-icon-large"
            />
          ) : (
            <div className="hero-placeholder-large">
              {(heroObj?.name || hero)[0]}
            </div>
          )}
          <h2>{heroObj?.displayName || heroObj?.name || hero}</h2>
        </div>
      )}

      {result.length > 0 && (
        <div style={{ marginTop: 24 }}>
          {/* Single grid for all 12 items */}
          <div className="item-grid">
            {result.map((it, i) => {
              const imgSrc = getImageUrl(it);
              const isLocked = i >= 9; // Last 3 items are locked

              const palette: Record<string, string> = {
                weapon: "rgba(245,158,11,0.22)",
                vitality: "rgba(16,185,129,0.22)",
                spirit: "rgba(59,130,246,0.22)",
              };
              const tint =
                palette[(it.slot as string) || "weapon"] ?? "transparent";

              return (
                <div
                  className={`item-card ${isLocked ? "locked" : ""}`}
                  key={it.id ?? i}
                  title={it.description?.desc ?? ""}
                  style={{ ["--tint" as any]: tint }}
                >
                  <div className="item-img-wrap">
                    {imgSrc ? (
                      <img
                        className="item-img"
                        src={imgSrc}
                        alt={itemName(it)}
                      />
                    ) : (
                      <div className="item-placeholder">?</div>
                    )}
                  </div>
                  <div className="item-title">{itemName(it)}</div>
                  {typeof (it as any).cost === "number" && (
                    <div className="item-cost">
                      <img
                        src="/souls icon.png"
                        alt="Souls"
                        className="cost-icon"
                      />
                      <span>{(it as any).cost.toLocaleString()}</span>
                    </div>
                  )}
                  {isLocked && <div className="lock-indicator">🔒</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
