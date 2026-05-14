"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "ai_master_device_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    try {
      let id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = generateUUID();
        localStorage.setItem(STORAGE_KEY, id);
      }
      setDeviceId(id);
    } catch {
      // localStorage may be unavailable (private mode, etc.)
    }
  }, []);

  return deviceId;
}
