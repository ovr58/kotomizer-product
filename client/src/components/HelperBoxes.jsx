import * as THREE from 'three'
import { v4 as uuidv4 } from 'uuid'


const HelpersBoxes = ({ helpersBoxesObbArray }) => {
  return (
    <group
        key={uuidv4()}
    >
        {helpersBoxesObbArray.map((obb, i) => {
            return (
                <mesh
                    key={`${JSON.stringify(obb)}wireframeOBB/${i}`}
                    position={obb.center}
                    rotation={new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().setFromMatrix3(
                        obb.rotation
                    ))}
                    castShadow = {false}
                    receiveShadow = {false}
                >
                    <boxGeometry args={[
                        obb.halfSize.x*2, 
                        obb.halfSize.y*2, 
                        obb.halfSize.z*2
                    ]} />
                    <meshBasicMaterial color={'red'} wireframe wireframeLinewidth={0.15}/>
                </mesh>
            )
        })}
    </group>
  )
}

export default HelpersBoxes;