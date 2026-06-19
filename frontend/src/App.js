import React from "react";
import "@/App.css";
import { GameProvider } from "./store/gameStore";
import Game from "./pages/Game";

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;
