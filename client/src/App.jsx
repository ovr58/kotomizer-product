import Customizer from "./pages/Customizer"
import Home from "./pages/Home"
import CanvasComponent from "./pages/CanvasComponent"

import { useSnapshot } from "valtio"
import appState from "./store"

function App() {
  const snap = useSnapshot(appState)
  return (
   <main className='select-none app transition-all ease-in'>
      {snap.intro && <Home />}
      {!snap.intro && <Customizer />}
      <CanvasComponent />
   </main>
  )
}

export default App
