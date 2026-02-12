import React, { useEffect, useState } from "react";
import HeroSelector from "./components/HeroSelector";
import Randomizer from "./components/Randomizer";
import { WHITELIST } from "./data/whitelist";

type Item = any;
type Hero = {
  id?: string;
  name?: string;
  displayName?: string;
  img?: string;
  images?: { icon_hero_card_webp?: string; icon_hero_card?: string };
};

const HERO_WHITELIST = new Set([
  "Abrams",
  "Apollo",
  "Bebop",
  "Billy",
  "Calico",
  "Celeste",
  "The Doorman",
  "Drifter",
  "Dynamo",
  "Graves",
  "Grey Talon",
  "Haze",
  "Holliday",
  "Infernus",
  "Ivy",
  "Kelvin",
  "Lady Geist",
  "Lash",
  "McGinnis",
  "Mina",
  "Mirage",
  "Mo & Krill",
  "Paige",
  "Paradox",
  "Pocket",
  "Rem",
  "Seven",
  "Shiv",
  "Silver",
  "Sinclair",
  "Venator",
  "Victor",
  "Vindicta",
  "Viscous",
  "Vyper",
  "Warden",
  "Wraith",
]);

function parseQueryParam(name: string) {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function setQueryParams(params: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const k of Object.keys(params)) {
    const v = params[k];
    if (v == null) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history.replaceState({}, "", url.toString());
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHeroPool, setSelectedHeroPool] = useState<Set<string>>(
    new Set(),
  );

  const initialHero = (parseQueryParam("hero") as string) || undefined;

  const [selectedHero, setSelectedHero] = useState<string | undefined>(
    initialHero,
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(
        "https://assets.deadlock-api.com/v2/items/by-slot-type/weapon",
      ).then((r) => (r.ok ? r.json() : [])),
      fetch(
        "https://assets.deadlock-api.com/v2/items/by-slot-type/spirit",
      ).then((r) => (r.ok ? r.json() : [])),
      fetch(
        "https://assets.deadlock-api.com/v2/items/by-slot-type/vitality",
      ).then((r) => (r.ok ? r.json() : [])),
      fetch("https://assets.deadlock-api.com/v2/heroes").then((r) =>
        r.ok ? r.json() : [],
      ),
    ])
      .then(([wepData, spiritData, vitData, heroesData]) => {
        const wepList = Array.isArray(wepData)
          ? wepData
          : (wepData.items ?? []);
        const spiritList = Array.isArray(spiritData)
          ? spiritData
          : (spiritData.items ?? []);
        const vitList = Array.isArray(vitData)
          ? vitData
          : (vitData.items ?? []);

        const tagged = [
          ...wepList.map((it: any) => ({ ...it, slot: "weapon" })),
          ...spiritList.map((it: any) => ({ ...it, slot: "spirit" })),
          ...vitList.map((it: any) => ({ ...it, slot: "vitality" })),
        ];

        // Filter by whitelist and merge with cost data
        const whitelistNames = new Set(WHITELIST.map((w) => w.name));
        const whitelistByName = new Map(WHITELIST.map((w) => [w.name, w]));

        const filtered = tagged.filter((it: any) =>
          whitelistNames.has(it.name || it.displayName),
        );

        const merged = filtered.map((it: any) => {
          const wlItem = whitelistByName.get(it.name || it.displayName);
          return {
            ...it,
            cost: wlItem?.cost ?? 0,
          };
        });

        setItems(merged);

        const hlist = Array.isArray(heroesData)
          ? heroesData
          : (heroesData.heroes ?? []);

        // Filter by whitelist and extract hero icon
        const filteredHeroes = hlist
          .filter((h: any) => HERO_WHITELIST.has(h.name))
          .map((h: any) => ({
            id: h.id,
            name: h.name,
            displayName: h.name,
            img: h.images?.icon_hero_card_webp || h.images?.icon_hero_card,
            images: h.images,
          }));

        setHeroes(filteredHeroes);
        // Auto-select all heroes on first load
        if (selectedHeroPool.size === 0) {
          const allIds = filteredHeroes.map((h: Hero) => h.id ?? h.name ?? "");
          setSelectedHeroPool(new Set(allIds));
          if (!selectedHero && filteredHeroes.length > 0) {
            const firstHero =
              filteredHeroes[0].id ??
              filteredHeroes[0].name ??
              filteredHeroes[0].displayName;
            setSelectedHero(firstHero);
          }
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setQueryParams({ hero: selectedHero ?? null });
  }, [selectedHero]);

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="container">
          <h1>Deadlock Ultimate Bravery</h1>

          {loading && <p>Loading assets...</p>}
          {error && <p className="error">Error: {error}</p>}
          {!loading && !error && selectedHero && (
            <Randomizer
              items={items}
              hero={selectedHero}
              heroObj={heroes.find(
                (h) => h.id === selectedHero || h.name === selectedHero,
              )}
              selectedHeroPool={selectedHeroPool}
              heroes={heroes}
              onHeroChange={(heroId: string) => setSelectedHero(heroId)}
            />
          )}
        </div>
      </div>

      <aside className="hero-sidebar">
        <h2>Hero Pool</h2>
        <div className="sidebar-controls">
          <button
            onClick={() =>
              setSelectedHeroPool(
                new Set(heroes.map((h) => h.id ?? h.name ?? "")),
              )
            }
          >
            Select All
          </button>
          <button onClick={() => setSelectedHeroPool(new Set())}>
            Deselect All
          </button>
        </div>
        <div className="hero-grid">
          {heroes.map((h) => {
            const id = h.id ?? h.name ?? "";
            const isSelected = selectedHeroPool.has(id);
            return (
              <div
                key={id}
                className={`hero-icon ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  const newPool = new Set(selectedHeroPool);
                  if (newPool.has(id)) {
                    newPool.delete(id);
                  } else {
                    newPool.add(id);
                  }
                  setSelectedHeroPool(newPool);
                }}
                title={h.displayName || h.name || id}
              >
                {h.img ? (
                  <img src={h.img} alt={h.displayName || h.name || id} />
                ) : (
                  <div className="hero-placeholder">
                    {(h.displayName || h.name || id)[0]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
