"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createMapNote, fetchMapHeatmap, fetchMapNotes } from "@/lib/api";
import type { MapHeatmap, MapNote } from "@/lib/types";

const categories = ["transport", "zielen", "infrastruktura", "bezpieczenstwo", "inne"];
const JASLO_CENTER: [number, number] = [21.4725, 49.7451];

function parseGeometry(geometria: string): { lat: number; lng: number } | null {
  const pointMatch = geometria.match(/POINT\(\s*([-0-9.]+)\s+([-0-9.]+)\s*\)/i);
  if (pointMatch) {
    return { lng: Number(pointMatch[1]), lat: Number(pointMatch[2]) };
  }

  const [latRaw, lngRaw] = geometria.split(",");
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

export default function MapaPage() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const selectedMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const noteMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [notes, setNotes] = useState<MapNote[]>([]);
  const [heatmap, setHeatmap] = useState<MapHeatmap | null>(null);
  const [selected, setSelected] = useState({ lat: JASLO_CENTER[1], lng: JASLO_CENTER[0] });
  const [tytul, setTytul] = useState("");
  const [opis, setOpis] = useState("");
  const [kategoria, setKategoria] = useState(categories[0]);
  const [status, setStatus] = useState("");
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const loadData = async () => {
    try {
      const [noteData, heatData] = await Promise.all([fetchMapNotes(), fetchMapHeatmap()]);
      setNotes(noteData);
      setHeatmap(heatData);
    } catch {
      setStatus("Nie mozna pobrac danych mapy.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const points = useMemo(() => {
    return notes
      .map((note) => {
        const parsed = parseGeometry(note.geometria);
        if (!parsed) return null;
        return { ...note, ...parsed };
      })
      .filter(Boolean) as Array<MapNote & { lat: number; lng: number }>;
  }, [notes]);

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: JASLO_CENTER,
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("click", (event) => {
      setSelected({
        lat: Number(event.lngLat.lat.toFixed(6)),
        lng: Number(event.lngLat.lng.toFixed(6)),
      });
    });

    map.on("load", () => {
      map.addSource("heatmap-notes", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "heatmap-notes",
        type: "heatmap",
        source: "heatmap-notes",
        paint: {
          "heatmap-weight": 0.8,
          "heatmap-intensity": 1.2,
          "heatmap-radius": 36,
          "heatmap-opacity": 0.65,
        },
      });
    });

    mapRef.current = map;
    return () => {
      noteMarkersRef.current.forEach((marker) => marker.remove());
      selectedMarkerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    selectedMarkerRef.current?.remove();
    selectedMarkerRef.current = new mapboxgl.Marker({ color: "#dc2626" })
      .setLngLat([selected.lng, selected.lat])
      .addTo(map);
  }, [selected]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    noteMarkersRef.current.forEach((marker) => marker.remove());
    noteMarkersRef.current = points.map((point) =>
      new mapboxgl.Marker({ color: "#1d4ed8" })
        .setLngLat([point.lng, point.lat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(`<strong>${point.tytul}</strong><br />${point.kategoria}`))
        .addTo(map),
    );
  }, [points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateHeatmap = () => {
      const source = map.getSource("heatmap-notes") as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      source.setData({
        type: "FeatureCollection",
        features: (heatmap?.points ?? []).map((point) => ({
          type: "Feature" as const,
          properties: { kategoria: point.kategoria, status: point.status },
          geometry: {
            type: "Point" as const,
            coordinates: [point.lng, point.lat],
          },
        })),
      });
    };

    if (map.isStyleLoaded()) updateHeatmap();
    else map.once("load", updateHeatmap);
  }, [heatmap]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("vox_access_token");
    if (!token) {
      setStatus("Musisz byc zalogowany jako mieszkaniec, aby dodac uwage.");
      return;
    }

    try {
      await createMapNote({
        tytul,
        opis,
        kategoria,
        geometria: `${selected.lat},${selected.lng}`,
      });
      setTytul("");
      setOpis("");
      setStatus("Uwaga zostala zapisana i czeka na moderacje.");
      await loadData();
    } catch {
      setStatus("Nie mozna zapisac uwagi. Sprawdz role konta.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mapa konsultacji</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Wskaz miejsce na mapie gminy i dodaj uwage. Publicznie widoczne sa zatwierdzone
            zgloszenia, a urzednik moze analizowac aktywnosc jako mape ciepla.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="relative h-[540px] overflow-hidden border border-slate-300">
              {mapboxToken ? (
                <div ref={mapContainerRef} className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-100 p-8 text-center text-sm text-slate-700">
                  Brakuje tokenu Mapbox. Ustaw NEXT_PUBLIC_MAPBOX_TOKEN i przebuduj frontend.
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-white/90 p-3 text-sm shadow">
                Wybrane miejsce: {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
              </div>
            </div>
          </section>

          <aside className="grid gap-5">
            <section className="bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-bold">Dodaj uwage</h2>
              <form onSubmit={submit} className="mt-4 grid gap-3">
                <input
                  value={tytul}
                  onChange={(e) => setTytul(e.target.value)}
                  required
                  placeholder="Tytul uwagi"
                  className="rounded border border-slate-300 px-3 py-2"
                />
                <select
                  value={kategoria}
                  onChange={(e) => setKategoria(e.target.value)}
                  className="rounded border border-slate-300 px-3 py-2"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <textarea
                  value={opis}
                  onChange={(e) => setOpis(e.target.value)}
                  required
                  placeholder="Opis problemu lub propozycji"
                  className="h-28 rounded border border-slate-300 px-3 py-2"
                />
                <button className="rounded bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">
                  Zapisz uwage
                </button>
              </form>
              {status && <p className="mt-3 text-sm font-semibold text-blue-700">{status}</p>}
            </section>

            <section className="bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-bold">Aktywnosc</h2>
              <p className="mt-2 text-sm text-slate-600">
                Liczba punktow mapy ciepla: {heatmap?.count ?? 0}
              </p>
              <div className="mt-4 max-h-64 overflow-y-auto">
                {notes.slice(0, 8).map((note) => (
                  <div key={note.id} className="border-b border-slate-200 py-3">
                    <p className="font-semibold">{note.tytul}</p>
                    <p className="text-xs text-slate-500">
                      {note.kategoria} - {note.status} - {note.geometria}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
