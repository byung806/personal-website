'use client';

import { useCallback, useEffect, useState } from 'react';

export interface Planet {
  id: number;
  drawingData: string;
  x: number;
  y: number;
  createdAt: string;
}

/** Loads the garden's planets; `refresh` refetches after a launch. */
export function usePlanets() {
  const [planets, setPlanets] = useState<Planet[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/planets');
      if (res.ok) setPlanets(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { planets, refresh };
}
