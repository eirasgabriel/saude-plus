import { useEffect, useMemo, useState } from "react";

function obterSnapshotDispositivo() {
  if (typeof window === "undefined") {
    return {
      tipo: "desktop",
      largura: 1024,
      altura: 768,
      orientacao: "paisagem",
      toque: false,
      celular: false,
      tablet: false,
      desktop: true,
    };
  }

  const largura = window.innerWidth;
  const altura = window.innerHeight;
  const userAgent = navigator.userAgent || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const toque =
    maxTouchPoints > 0 ||
    window.matchMedia?.("(pointer: coarse)").matches ||
    "ontouchstart" in window;

  const iPadDesktopMode =
    navigator.platform === "MacIntel" && maxTouchPoints > 1;
  const uaTablet = /iPad|Tablet|PlayBook|Silk/i.test(userAgent);
  const uaAndroidTablet = /Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
  const uaCelular =
    /Mobi|Android.*Mobile|iPhone|iPod|Windows Phone/i.test(userAgent);

  let tipo = "desktop";

  if (largura < 768 || uaCelular) {
    tipo = "celular";
  } else if (
    largura < 1180 ||
    iPadDesktopMode ||
    uaTablet ||
    uaAndroidTablet ||
    (toque && largura <= 1366)
  ) {
    tipo = "tablet";
  }

  return {
    tipo,
    largura,
    altura,
    orientacao: largura >= altura ? "paisagem" : "retrato",
    toque,
    celular: tipo === "celular",
    tablet: tipo === "tablet",
    desktop: tipo === "desktop",
  };
}

function usarDispositivo() {
  const [snapshot, setSnapshot] = useState(obterSnapshotDispositivo);

  useEffect(() => {
    let frame = null;

    function atualizar() {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setSnapshot(obterSnapshotDispositivo());
      });
    }

    atualizar();
    window.addEventListener("resize", atualizar);
    window.addEventListener("orientationchange", atualizar);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", atualizar);
      window.removeEventListener("orientationchange", atualizar);
    };
  }, []);

  return useMemo(() => snapshot, [snapshot]);
}

export { obterSnapshotDispositivo, usarDispositivo };
