import React from "react";

function obterInicial(nome) {
  const texto = String(nome || "").trim();
  return texto ? texto.charAt(0).toUpperCase() : "";
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

  const inicial = obterInicial(nome);

  return (
    <div className={className}>
      {inicial || (
        <img
          src="/icons/logo-saude-plus.png"
          alt="Saude+"
          className="h-4/5 w-4/5 object-contain"
        />
      )}
    </div>
  );
}

export default FotoClinica;
