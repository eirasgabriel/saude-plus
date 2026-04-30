import React from "react";

const TAMANHOS = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20",
  xl: "h-24 w-24",
};

function LogoSaudePlus({ size = "md", className = "" }) {
  const tamanho = TAMANHOS[size] || TAMANHOS.md;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] shadow-lg ring-1 ring-sky-200/70 ${tamanho} ${className}`}
    >
      <img
        src="/icons/icon-512.png"
        alt="Saude+"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export default LogoSaudePlus;
