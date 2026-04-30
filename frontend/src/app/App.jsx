import Rotas from "./routes/rotas";
import { usarDispositivo } from "../infrastructure/device/use-dispositivo";

function App() {
  const dispositivo = usarDispositivo();

  return (
    <div
      className={`min-h-svh device-${dispositivo.tipo}`}
      data-dispositivo={dispositivo.tipo}
      data-orientacao={dispositivo.orientacao}
      data-toque={dispositivo.toque ? "sim" : "nao"}
    >
      <Rotas />
    </div>
  );
}

export default App;
