"use client";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

const CENTRUM_GMINY: [number, number] = [21.471722, 49.743194];
const ZOOM_POCZATKOWY = 13;
const KATEGORIE = ["transport", "zieleń", "infrastruktura", "inne"];

interface Uwaga {
  id: number;
  lat: number | null;
  lng: number | null;
  tytul: string;
  opis: string;
  kategoria: string;
  data_dodania: string;
}

export default function MapaUwag() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [formularz, setFormularz] = useState<{ lat: number; lng: number } | null>(null);
  const [dane, setDane] = useState({ tytul: "", opis: "", kategoria: "inne" });
  const [wysylanie, setWysylanie] = useState(false);
  const [blad, setBlad] = useState("");

  const [heatmapWlaczona, setHeatmapWlaczona] = useState(false);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: CENTRUM_GMINY,
      zoom: ZOOM_POCZATKOWY,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("heatmap-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "heatmap-layer",
        type: "heatmap",
        source: "heatmap-source",
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": 1,
          "heatmap-radius": 35,
          "heatmap-opacity": 0.85,
          // gradient kolorów: przezroczysty → niebieski → zielony → żółty → czerwony
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0,   "rgba(0,0,255,0)",
            0.2, "#1a78c2",
            0.4, "#22c55e",
            0.6, "#facc15",
            0.8, "#f97316",
            1,   "#ef4444",
          ],
        },
        layout: { visibility: "none" },
      });

      zaladujUwagi(map);
    });

    map.on("click", (e) => {
      setFormularz({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      setBlad("");
      setDane({ tytul: "", opis: "", kategoria: "inne" });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const zaladujUwagi = async (map: mapboxgl.Map) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/map/uwagi/`);
      if (!res.ok) throw new Error("Błąd pobierania uwag");
      const uwagi: Uwaga[] = await res.json();

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      uwagi.forEach((uwaga) => {
        if (uwaga.lat == null || uwaga.lng == null) return;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="font-family: sans-serif; max-width: 200px;">
            <strong>${uwaga.tytul}</strong>
            <p style="margin: 4px 0; color: #666; font-size: 12px;">${uwaga.kategoria}</p>
            <p style="margin: 4px 0; font-size: 13px;">${uwaga.opis || "Brak opisu"}</p>
            <span style="font-size: 11px; color: #999;">
              ${new Date(uwaga.data_dodania).toLocaleDateString("pl-PL")}
            </span>
          </div>
        `);

        const marker = new mapboxgl.Marker({ color: kolorKategorii(uwaga.kategoria) })
          .setLngLat([uwaga.lng, uwaga.lat])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });

      const validne = uwagi.filter((u) => u.lat != null && u.lng != null);

      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: validne.map((u) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [u.lng as number, u.lat as number],
          },
          properties: { kategoria: u.kategoria },
        })),
      };

      const source = map.getSource("heatmap-source") as mapboxgl.GeoJSONSource | undefined;
      if (source) {
        source.setData(geojson);
      }

    } catch (err) {
      console.error("Błąd ładowania uwag:", err);
    }
  };

  const wyslijUwage = async () => {
    if (!dane.tytul.trim()) {
      setBlad("Tytuł jest wymagany.");
      return;
    }
    setWysylanie(true);
    setBlad("");

    const userData = localStorage.getItem("user");
    const token = userData ? JSON.parse(userData).access_token : null;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/map/uwagi/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          lat: formularz?.lat,
          lng: formularz?.lng,
          tytul: dane.tytul,
          opis: dane.opis,
          kategoria: dane.kategoria,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData));
      }

      setFormularz(null);
      if (mapRef.current) zaladujUwagi(mapRef.current);
    } catch (err) {
      console.error(err);
      setBlad("Nie udało się dodać uwagi.");
    } finally {
      setWysylanie(false);
    }
  };

  const toggleHeatmap = () => {
    if (!mapRef.current) return;
    const nowyStan = !heatmapWlaczona;
    mapRef.current.setLayoutProperty(
      "heatmap-layer",
      "visibility",
      nowyStan ? "visible" : "none"
    );
    setHeatmapWlaczona(nowyStan);
  };

  const kolorKategorii = (kat: string) => {
    const kolory: Record<string, string> = {
      transport: "#3b82f6",
      zieleń: "#22c55e",
      infrastruktura: "#f97316",
      inne: "#a855f7",
    };
    return kolory[kat] || "#6b7280";
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Legenda */}
      <div style={styles.legenda}>
        <strong style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
          Kategorie
        </strong>
        {[
          { kat: "transport", kolor: "#3b82f6" },
          { kat: "zieleń", kolor: "#22c55e" },
          { kat: "infrastruktura", kolor: "#f97316" },
          { kat: "inne", kolor: "#a855f7" },
        ].map(({ kat, kolor }) => (
          <div key={kat} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: kolor }} />
            <span style={{ fontSize: 12 }}>{kat}</span>
          </div>
        ))}
        <p style={{ fontSize: 11, color: "#6b7280", marginTop: 8, marginBottom: 0 }}>
          Kliknij na mapie, aby dodać uwagę
        </p>
      </div>

      {/* ── NOWE: przycisk przełącznika heatmapy ─────────────────────────── */}
      <div style={styles.btnHeatmapWrapper}>
        <button onClick={toggleHeatmap} style={{
          ...styles.btnHeatmap,
          background: heatmapWlaczona ? "#1d4ed8" : "white",
          color: heatmapWlaczona ? "white" : "#1d4ed8",
        }}>
          {heatmapWlaczona ? "🗺️ Pokaż pinezki" : "🔥 Mapa ciepła"}
        </button>
      </div>
      {/* ── koniec NOWEGO ──────────────────────────────────────────────── */}

      {/* Formularz */}
      {formularz && (
        <div style={styles.formularzOverlay}>
          <div style={styles.formularz}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Dodaj uwagę</h3>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280" }}>
              📍 {formularz.lat.toFixed(5)}, {formularz.lng.toFixed(5)}
            </p>

            <label style={styles.label}>Tytuł *</label>
            <input
              style={styles.input}
              value={dane.tytul}
              onChange={(e) => setDane({ ...dane, tytul: e.target.value })}
              placeholder="Krótki opis problemu"
            />

            <label style={styles.label}>Kategoria</label>
            <select
              style={styles.input}
              value={dane.kategoria}
              onChange={(e) => setDane({ ...dane, kategoria: e.target.value })}
            >
              {KATEGORIE.map((k) => (
                <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>
              ))}
            </select>

            <label style={styles.label}>Opis (opcjonalnie)</label>
            <textarea
              style={{ ...styles.input, height: 80, resize: "vertical" }}
              value={dane.opis}
              onChange={(e) => setDane({ ...dane, opis: e.target.value })}
              placeholder="Więcej szczegółów..."
            />

            {blad && (
              <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 8px" }}>{blad}</p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={wyslijUwage} disabled={wysylanie} style={styles.btnPrimary}>
                {wysylanie ? "Wysyłanie..." : "Dodaj uwagę"}
              </button>
              <button onClick={() => setFormularz(null)} style={styles.btnSecondary}>
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  legenda: {
    position: "absolute",
    bottom: 30,
    left: 10,
    background: "white",
    borderRadius: 8,
    padding: "10px 14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    zIndex: 10,
    color: "black",
  },
  btnHeatmapWrapper: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  btnHeatmap: {
    padding: "8px 14px",
    border: "2px solid #1d4ed8",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    transition: "all 0.2s",
  },
  formularzOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 20,
    color: "black",
  },
  formularz: {
    background: "white",
    borderRadius: 12,
    padding: 24,
    width: 340,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 12,
    boxSizing: "border-box",
    fontFamily: "inherit",
    color: "black",
  },
  btnPrimary: {
    flex: 1,
    padding: "10px 0",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 600,
  },
  btnSecondary: {
    flex: 1,
    padding: "10px 0",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
  },
};