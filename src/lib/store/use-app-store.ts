"use client";

import { useState, useEffect } from "react";
import { appStore } from "./app-store";

export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    appStore.init();
    const unsubscribe = appStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return appStore;
}
