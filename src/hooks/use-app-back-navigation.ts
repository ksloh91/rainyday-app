"use client";

import { useCallback, useEffect, useRef } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export type AppBackLayer = "sheet" | "merchant" | "insights";

type AppBackHandlers = {
  onPopSheet: () => void;
  onPopMerchant: () => void;
  onPopInsights: () => void;
};

export function useAppBackNavigation(handlers: AppBackHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const stackRef = useRef<AppBackLayer[]>([]);
  const ignorePopCountRef = useRef(0);

  const applyPop = useCallback((layer: AppBackLayer) => {
    switch (layer) {
      case "sheet":
        handlersRef.current.onPopSheet();
        break;
      case "merchant":
        handlersRef.current.onPopMerchant();
        break;
      case "insights":
        handlersRef.current.onPopInsights();
        break;
    }
  }, []);

  const pushLayer = useCallback((layer: AppBackLayer) => {
    stackRef.current.push(layer);
    window.history.pushState({ appBack: layer }, "");
  }, []);

  const removeLayer = useCallback((layer: AppBackLayer) => {
    const index = stackRef.current.lastIndexOf(layer);
    if (index === -1) return false;
    stackRef.current.splice(index, 1);
    return true;
  }, []);

  const dismissLayer = useCallback(
    (layer: AppBackLayer) => {
      const index = stackRef.current.lastIndexOf(layer);
      if (index === -1) return false;
      const isTop = index === stackRef.current.length - 1;
      if (isTop) {
        window.history.back();
        return true;
      }
      stackRef.current.splice(index, 1);
      applyPop(layer);
      return true;
    },
    [applyPop],
  );

  const clearLayers = useCallback(
    (layers: AppBackLayer[]) => {
      const removed = layers.filter((layer) => removeLayer(layer));
      if (removed.length === 0) return;
      ignorePopCountRef.current += removed.length;
      window.history.go(-removed.length);
      for (const layer of removed) {
        applyPop(layer);
      }
    },
    [applyPop, removeLayer],
  );

  const canGoBack = useCallback(() => stackRef.current.length > 0, []);

  useEffect(() => {
    const handlePopState = () => {
      if (ignorePopCountRef.current > 0) {
        ignorePopCountRef.current -= 1;
        return;
      }
      const layer = stackRef.current.pop();
      if (layer) applyPop(layer);
    };

    window.addEventListener("popstate", handlePopState);

    let removeBackListener: (() => void) | undefined;
    if (Capacitor.isNativePlatform()) {
      void App.addListener("backButton", () => {
        if (canGoBack()) {
          window.history.back();
        } else {
          void App.exitApp();
        }
      }).then((handle) => {
        removeBackListener = () => {
          void handle.remove();
        };
      });
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      removeBackListener?.();
    };
  }, [applyPop, canGoBack]);

  return { pushLayer, dismissLayer, clearLayers };
}
