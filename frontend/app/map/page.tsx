"use client";
import dynamic from "next/dynamic";

// dynamic import wymagany, bo Mapbox używa window (tylko przeglądarka)
const MapaUwag = dynamic(() => import("@/components/MapaUwag"), { ssr: false });

export default function StronaMapa() {
  return (
    <main>
      <h1>Mapa konsultacji</h1>
      <MapaUwag />
    </main>
  );
}