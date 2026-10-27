"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { Feature, FeatureCollection, Geometry, Position } from "geojson";

interface RotatingEarthProps {
  size?: number;
  className?: string;
}

const LAND_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json";

const pointInRing = (point: [number, number], ring: Position[]) => {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
};

/** Inside the outer ring and outside every hole. */
const pointInPolygon = (point: [number, number], rings: Position[][]) => {
  if (!pointInRing(point, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(point, rings[i])) return false;
  }
  return true;
};

const pointInFeature = (point: [number, number], feature: Feature<Geometry>) => {
  const geometry = feature.geometry;
  if (geometry.type === "Polygon") {
    return pointInPolygon(point, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((rings) => pointInPolygon(point, rings));
  }
  return false;
};

/** Lat/lng samples on a fixed grid, kept where they fall on land. */
const generateDots = (feature: Feature<Geometry>, step: number) => {
  const dots: [number, number][] = [];
  const [[minLng, minLat], [maxLng, maxLat]] = d3.geoBounds(feature);

  for (let lng = minLng; lng <= maxLng; lng += step) {
    for (let lat = minLat; lat <= maxLat; lat += step) {
      const point: [number, number] = [lng, lat];
      if (pointInFeature(point, feature)) dots.push(point);
    }
  }

  return dots;
};

/**
 * Slowly rotating wireframe globe: graticule and coastlines in hairline
 * white over a black sphere, land filled with halftone dots.
 *
 * Drawn to canvas rather than SVG because the dot field runs to several
 * thousand points that are re-projected every frame — as DOM nodes that
 * would be far too much to keep up with.
 */
export default function RotatingEarth({
  size = 520,
  className = "",
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Leaves a hairline of margin for the sphere's stroke; any smaller
    // divisor and the outline clips against the canvas edge.
    const radius = size / 2.08;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    context.scale(dpr, dpr);

    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([size / 2, size / 2])
      .clipAngle(90);

    const path = d3.geoPath(projection, context);
    const graticule = d3.geoGraticule();

    let land: FeatureCollection<Geometry> | null = null;
    let dots: [number, number][] = [];
    let cancelled = false;

    const render = () => {
      context.clearRect(0, 0, size, size);

      context.beginPath();
      context.arc(size / 2, size / 2, projection.scale(), 0, 2 * Math.PI);
      context.fillStyle = "#000000";
      context.fill();
      context.strokeStyle = "#ffffff";
      context.lineWidth = 1.5;
      context.stroke();

      if (!land) return;

      context.beginPath();
      path(graticule());
      context.strokeStyle = "#ffffff";
      context.lineWidth = 0.6;
      context.globalAlpha = 0.22;
      context.stroke();
      context.globalAlpha = 1;

      context.beginPath();
      land.features.forEach((feature) => path(feature));
      context.strokeStyle = "#ffffff";
      context.lineWidth = 0.8;
      context.stroke();

      for (const dot of dots) {
        const projected = projection(dot);
        if (!projected) continue;
        context.beginPath();
        context.arc(projected[0], projected[1], 1.1, 0, 2 * Math.PI);
        context.fillStyle = "#8f8f8f";
        context.fill();
      }
    };

    render();

    fetch(LAND_URL)
      .then((response) => {
        if (!response.ok) throw new Error("land data unavailable");
        return response.json();
      })
      .then((data: FeatureCollection<Geometry>) => {
        if (cancelled) return;
        land = data;
        dots = data.features.flatMap((feature) => generateDots(feature, 1.3));
        render();
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    const rotation: [number, number] = [0, -12];
    let autoRotate = true;

    const timer = d3.timer(() => {
      if (!autoRotate) return;
      rotation[0] += 0.18;
      projection.rotate(rotation);
      render();
    });

    const onPointerDown = (event: PointerEvent) => {
      autoRotate = false;
      canvas.setPointerCapture(event.pointerId);

      const startX = event.clientX;
      const startY = event.clientY;
      const [startLambda, startPhi] = rotation;

      const onPointerMove = (move: PointerEvent) => {
        // Degrees turned per pixel dragged, scaled so a drag across the
        // sphere's width turns it roughly half a revolution at any size.
        const sensitivity = 180 / projection.scale();
        rotation[0] = startLambda + (move.clientX - startX) * sensitivity;
        rotation[1] = Math.max(
          -90,
          Math.min(90, startPhi - (move.clientY - startY) * sensitivity)
        );
        projection.rotate(rotation);
        render();
      };

      const onPointerUp = (up: PointerEvent) => {
        canvas.releasePointerCapture(up.pointerId);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        autoRotate = true;
      };

      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const next = projection.scale() * (event.deltaY > 0 ? 0.92 : 1.08);
      projection.scale(Math.max(radius * 0.6, Math.min(radius * 2.5, next)));
      render();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    // Not passive: the handler calls preventDefault to stop the page
    // scrolling out from under a zoom gesture.
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelled = true;
      timer.stop();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [size]);

  // No fallback UI: the globe is decoration, so a failed fetch should leave
  // the footer as it was rather than putting an error where an ornament was.
  if (failed) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block cursor-grab touch-none active:cursor-grabbing ${className}`}
    />
  );
}
