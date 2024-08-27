import { useState } from "react";


const CloseButton = ({ closeButtonRef, position, setOpenState, scale = [0,0,0], buttonKey = 'fromMaterialChanger' }) => {

  const [hoveredCloseButton, setCloseButtonHover] = useState(1)
  console.log('CLOSE BUTTON - ', position)
  return (
    <group
      name={'CloseButton'}
      key={buttonKey}
      ref={closeButtonRef}
      position={position}
      scale={scale}
      rotation={[0,0,Math.PI/4]}
      onPointerOver={() => setCloseButtonHover(1.4)}
      onPointerOut={() => setCloseButtonHover(1)}
      onClick={(e) => (e.stopPropagation(), setOpenState(false))}
      >
      <mesh
        key={'up'+buttonKey}
      >
        <boxGeometry args={[0.07*hoveredCloseButton, 0.02*hoveredCloseButton, 0.02*hoveredCloseButton]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh
        key={'right'+buttonKey}
      >
        <boxGeometry args={[0.02*hoveredCloseButton, 0.07*hoveredCloseButton, 0.02*hoveredCloseButton]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  );
};

export default CloseButton;