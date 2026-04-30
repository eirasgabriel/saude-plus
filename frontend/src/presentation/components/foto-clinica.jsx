import React from "react";

function obterInicial(nome) {
  const texto = String(nome || "").trim();
  return texto ? texto.charAt(0).toUpperCase() : "+";
}

function FotoClinica({
  src,
  nome,
  className = "flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-2xl font-bold text-blue-500",
  imgClassName = "h-full w-full object-cover",
}) {
  if (src) {
    return (
      <div className={className}>
        <img src={src} alt={`Foto de ${nome || "clinica"}`} className={imgClassName} />
      </div>
    );
  }

  return <div className={className}>{obterInicial(nome)}</div>;
}

export default FotoClinica;
