'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { Interactable } from '../interaction/Interactable';
import { useSceneStore } from '@/store/useSceneStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Vector3 } from 'three';

function TriggerCube() {
  const [active, setActive] = useState(false);
  
  return (
    <RigidBody type="fixed" position={[-2, 1, -3]}>
      <Interactable 
        id="trigger-cube" 
        type="trigger" 
        title="Control Cube"
        position={[0, 0, 0]}
        actions={[
          {
            label: active ? "Deactivate" : "Activate",
            key: 'F',
            onStart: () => setActive(!active)
          },
          {
            label: "Analyze",
            key: 'C',
            onStart: () => console.log("Analyzing Cube...")
          }
        ]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry />
          <meshStandardMaterial color={active ? "#10b981" : "#ef4444"} />
        </mesh>
      </Interactable>
    </RigidBody>
  );
}

function GrabSphere() {
  const api = useRef<RapierRigidBody>(null);
  const id = "grab-sphere";
  const heldId = useSceneStore((state) => state.heldId);
  const setHeld = useSceneStore((state) => state.setHeld);
  const isHeld = heldId === id;
  
  const { camera } = useThree();
  const grabDistance = useRef(0);

  useFrame((state, delta) => {
    if (isHeld && api.current) {
        // Target position based on stored distance, relative to camera
        const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const targetPos = new Vector3().copy(camera.position).add(direction.multiplyScalar(grabDistance.current));
        
        // Smooth interpolation
        const currentPos = api.current.translation();
        const currentVec = new Vector3(currentPos.x, currentPos.y, currentPos.z);
        
        // Lerp factor - 15 gives a snappy but smooth follow
        currentVec.lerp(targetPos, delta * 15);
        
        api.current.setNextKinematicTranslation(currentVec);
        api.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  const handleToggleHold = () => {
    if (isHeld) {
        setHeld(null);
        if (api.current) api.current.setBodyType(2, true); // Keep Kinematic
    } else {
        setHeld(id);
        if (api.current) {
            api.current.setBodyType(2, true); // KinematicPosition
            // Calculate and store initial distance to maintain relative position
            const currentPos = api.current.translation();
            const dist = camera.position.distanceTo(new Vector3(currentPos.x, currentPos.y, currentPos.z));
            grabDistance.current = dist;
        }
    }
  };

  return (
    <RigidBody 
      ref={api} 
      colliders="ball" 
      position={[0, 1, -3]} 
      type="kinematicPosition" 
    >
      <Interactable 
        id={id}
        type="grab" 
        title="Grav Sphere"
        position={[0, 0, 0]}
        actions={[
          {
              label: isHeld ? "Drop" : "Grab",
              key: 'F',
              onStart: handleToggleHold
          }
        ]}
      >
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.5]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.5} />
        </mesh>
      </Interactable>
    </RigidBody>
  );
}

function VolumeZone() {
  const [inside, setInside] = useState(false);

  return (
    <RigidBody type="fixed" sensor position={[2, 1, -3]}
        onIntersectionEnter={() => setInside(true)}
        onIntersectionExit={() => setInside(false)}
    >
        <Interactable
            id="volume-zone"
            type="volume"
            title="Danger Zone"
            position={[0, 0, 0]}
            actions={[]}
        >
            <CuboidCollider args={[1, 1, 1]} />
            <mesh>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial 
                    color={inside ? "#fbbf24" : "#e4e4e7"} 
                    transparent 
                    opacity={0.2} 
                    wireframe={!inside} 
                />
            </mesh>
            {inside && (
                 <group position={[0, 2, 0]}>
                     <mesh>
                         <boxGeometry args={[0.5, 0.5, 0.5]} />
                         <meshStandardMaterial color="#f59e0b" />
                     </mesh>
                 </group>
            )}
        </Interactable>
    </RigidBody>
  );
}

export function DemoWorld() {
  const showGrid = useSettingsStore((state) => state.settings.showGrid);

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" position={[0, -1, 0]}>
         {/* Invisible collider floor so objects don't fall into void */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#f4f4f5" />
        </mesh>
        {showGrid && (
             <gridHelper args={[50, 50, "#e4e4e7", "#e4e4e7"]} position={[0, -0.99, 0]} />
        )}
      </RigidBody>

      <TriggerCube />
      <GrabSphere />
      <VolumeZone />
    </group>
  );
}
