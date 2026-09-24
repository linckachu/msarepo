"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CatalogItem, CatalogKind } from "@/data/catalog";

type Filter = "tümü" | CatalogKind;

const filters: { label: string; value: Filter }[] = [
  { label: "Tümü", value: "tümü" },
  { label: "Filmler", value: "film" },
  { label: "Diziler", value: "dizi" },
];

const demoStreamUrl =
  process.env.NEXT_PUBLIC_DEMO_STREAM_URL ??
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export function CatalogHome({ items }: { items: CatalogItem[] }) {
  const [filter, setFilter] = useState<Filter>("tümü");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [playing, setPlaying] = useState<CatalogItem | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const featured = items[0];

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");

    return items.filter((item) => {
      const matchesFilter = filter === "tümü" || item.kind === filter;
      const matchesQuery =
        !normalized ||
        [item.title, item.originalTitle, ...item.genres]
          .join(" ")
          .toLocaleLowerCase("tr-TR")
          .includes(normalized);

      return matchesFilter && matchesQuery;
    });
  }, [filter, items, query]);

  useEffect(() => {
    if (!playing) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlaying(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      setPlayerUrl(null);
      setPlayerError(null);
      return;
    }

    if (!playing.sourceUrl) {
      setPlayerUrl(demoStreamUrl);
      return;
    }

    const controller = new AbortController();
    setPlayerUrl(null);
    setPlayerError(null);
    fetch(`/api/resolve?url=${encodeURIComponent(playing.sourceUrl)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json()) as { playerUrl?: string; error?: string };
        if (!response.ok || !body.playerUrl) {
          throw new Error(body.error ?? "Oynatıcı açılamadı.");
        }
        setPlayerUrl(body.playerUrl);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setPlayerError(error.message);
      });

    return () => controller.abort();
  }, [playing]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="HD Film Cehennemi ana sayfa">
          <span className="brand-mark">HD</span>
          <span className="brand-text">FİLM CEHENNEMİ</span>
        </a>

        <nav className="main-nav" aria-label="Ana menü">
          <a className="active" href="#top">Keşfet</a>
          <a href="#catalog" onClick={() => setFilter("film")}>Filmler</a>
          <a href="#catalog" onClick={() => setFilter("dizi")}>Diziler</a>
        </nav>

        <button
          className="icon-button"
          aria-label="Aramayı aç"
          onClick={() => setSearchOpen((value) => !value)}
        >
          <span aria-hidden="true">⌕</span>
        </button>
      </header>

      <section
        id="top"
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(6,7,10,.98) 0%, rgba(6,7,10,.82) 45%, rgba(6,7,10,.16) 100%), radial-gradient(circle at 78% 28%, ${featured.palette[1]} 0, transparent 27%), linear-gradient(135deg, ${featured.palette[0]}, #06070a 74%)`,
        }}
      >
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow"><span /> HAFTANIN SEÇİMİ</div>
          <h1>{featured.title}</h1>
          <p className="original-title">{featured.originalTitle}</p>
          <div className="meta-row">
            <span className="score">★ {featured.score}</span>
            <span>{featured.year}</span>
            <span>{featured.duration}</span>
            <span className="quality">4K</span>
          </div>
          <p className="hero-description">{featured.description}</p>
          <div className="genre-row">
            {featured.genres.map((genre) => <span key={genre}>{genre}</span>)}
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setPlaying(featured)}>
              ▶ Şimdi izle
            </button>
            <a className="secondary-button" href="#catalog">Kataloğu keşfet</a>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true">01</div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-heading">
          <div>
            <p className="section-kicker">ÖZENLE SEÇİLDİ</p>
            <h2>Şimdi keşfet</h2>
          </div>
          <div className="filter-row" role="group" aria-label="İçerik türü">
            {filters.map((item) => (
              <button
                key={item.value}
                className={filter === item.value ? "selected" : ""}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {searchOpen && (
          <form className="search-panel" onSubmit={submitSearch}>
            <label htmlFor="catalog-search">Film, dizi veya tür ara</label>
            <div>
              <input
                id="catalog-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Örn. gerilim"
                autoFocus
              />
              <button type="submit">Ara</button>
            </div>
          </form>
        )}

        {visibleItems.length > 0 ? (
          <div className="catalog-grid">
            {visibleItems.map((item, index) => (
              <article className="catalog-card" key={item.id}>
                <button
                  className="poster"
                  onClick={() => setPlaying(item)}
                  aria-label={`${item.title} videosunu oynat`}
                  style={{
                    backgroundImage: `radial-gradient(circle at 72% 25%, ${item.palette[1]} 0, transparent 32%), linear-gradient(145deg, ${item.palette[0]}, #090a0e 78%)`,
                  }}
                >
                  {item.posterUrl && (
                    // Kaynak sayfanın güncel posterini doğrudan gösteriyoruz.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="poster-image" src={item.posterUrl} alt="" aria-hidden="true" />
                  )}
                  <span className="poster-number">{String(index + 1).padStart(2, "0")}</span>
                  {item.label && <span className="card-label">{item.label}</span>}
                  <span className="poster-title">
                    <span>{item.originalTitle}</span>
                    <strong>{item.title}</strong>
                  </span>
                  <span className="card-play" aria-hidden="true">▶</span>
                </button>
                <div className="card-copy">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.genres.join(" · ")}</p>
                  </div>
                  <div className="card-meta">
                    <span>{item.year}</span>
                    <span>★ {item.score}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>Sonuç bulunamadı</strong>
            <p>Başka bir başlık veya tür deneyebilirsin.</p>
          </div>
        )}
      </section>

      <footer>
        <a className="brand compact" href="#top"><span className="brand-mark">HD</span><span className="brand-text">FİLM CEHENNEMİ</span></a>
        <p>Film ve dizi keşfetmenin sade yolu.</p>
        <span>© 2026</span>
      </footer>

      {playing && (
        <div className="player-overlay" role="dialog" aria-modal="true" aria-label={`${playing.title} video oynatıcı`}>
          <button className="player-backdrop" aria-label="Oynatıcıyı kapat" onClick={() => setPlaying(null)} />
          <div className="player-shell">
            <div className="player-topbar">
              <div>
                <strong>{playing.title}</strong>
                <span>{playing.year} · {playing.duration}</span>
              </div>
              <button aria-label="Oynatıcıyı kapat" onClick={() => setPlaying(null)}>×</button>
            </div>
            <div className="player-stage">
              {!playerUrl && !playerError && <div className="player-status">Oynatıcı hazırlanıyor…</div>}
              {playerError && <div className="player-status error">{playerError}</div>}
              {playerUrl && /\.(mp4|webm)(\?|$)/i.test(playerUrl) && (
                <video key={playing.id} controls autoPlay playsInline src={playerUrl}>
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
              )}
              {playerUrl && !/\.(mp4|webm)(\?|$)/i.test(playerUrl) && (
                <iframe
                  key={playing.id}
                  src={playerUrl}
                  title={`${playing.title} oynatıcı`}
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="origin"
                />
              )}
            </div>
            <p className="demo-note">Dizipal sayfasındaki güncel oynatıcı doğrudan açılıyor.</p>
          </div>
        </div>
      )}
    </main>
  );
}
