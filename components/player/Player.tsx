'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { Vector3, Euler } from 'three';
import { useInputStore } from '@/store/useInputStore';
import { useSplatStore } from '@/store/useSplatStore';
import { useSettingsStore } from '@/store/useSettingsStore';

const BASE_SPEED = 5;
const MOUSE_SENSITIVITY = 0.002;

export function Player() {
  const body = useRef<RapierRigidBody>(null);
  const { camera, gl } = useThree();
  const { move, look } = useInputStore();
  const moveSpeed = useSettingsStore((state) => state.settings.moveSpeed);
  
  const isMouseDown = useRef(false);
  
  useEffect(() => {
    const canvas = gl.domElement;
    
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Skip pointer lock if user is dragging gizmo
        if (useSplatStore.getState().isDraggingGizmo) return;
        isMouseDown.current = true;
        canvas.requestPointerLock();
      }
    };
    
    const onMouseUp = () => {
      isMouseDown.current = false;
      document.exitPointerLock();
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;
      
      const euler = new Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(camera.quaternion);
      
      euler.y -= e.movementX * MOUSE_SENSITIVITY;
      euler.x -= e.movementY * MOUSE_SENSITIVITY;
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
      euler.z = 0;
      
      camera.quaternion.setFromEuler(euler);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
    
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [camera, gl]);

  // Keyboard Input Logic
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const current = useInputStore.getState().move;
      
      useInputStore.getState().setKey(e.code, true);

      switch (e.code) {
        case 'KeyW': useInputStore.getState().setMove(current.x, 1, current.z); break;
        case 'KeyS': useInputStore.getState().setMove(current.x, -1, current.z); break;
        case 'KeyA': useInputStore.getState().setMove(-1, current.y, current.z); break;
        case 'KeyD': useInputStore.getState().setMove(1, current.y, current.z); break;
        case 'KeyE': useInputStore.getState().setMove(current.x, current.y, 1); break;
        case 'KeyQ': useInputStore.getState().setMove(current.x, current.y, -1); break;
      }
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
       const current = useInputStore.getState().move;
       
       useInputStore.getState().setKey(e.code, false);

       switch (e.code) {
        case 'KeyW': if (current.y > 0) useInputStore.getState().setMove(current.x, 0, current.z); break;
        case 'KeyS': if (current.y < 0) useInputStore.getState().setMove(current.x, 0, current.z); break;
        case 'KeyA': if (current.x < 0) useInputStore.getState().setMove(0, current.y, current.z); break;
        case 'KeyD': if (current.x > 0) useInputStore.getState().setMove(0, current.y, current.z); break;
        case 'KeyE': if (current.z > 0) useInputStore.getState().setMove(current.x, current.y, 0); break;
        case 'KeyQ': if (current.z < 0) useInputStore.getState().setMove(current.x, current.y, 0); break;
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!body.current) return;

    const { move, look } = useInputStore.getState();
    
    if (look.x !== 0 || look.y !== 0) {
      const euler = new Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(camera.quaternion);
      
      // Look sensitivity for mobile joystick
      euler.y -= look.x * delta * 2;
      euler.x -= look.y * delta * 2;
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
      euler.z = 0;
      
      camera.quaternion.setFromEuler(euler);
    }

    const frontVector = new Vector3(0, 0, 0);
    const sideVector = new Vector3(0, 0, 0);
    const direction = new Vector3();

    frontVector.set(0, 0, -move.y); 
    sideVector.set(move.x, 0, 0);

    const flyDirection = new Vector3(0, 0, -move.y).applyQuaternion(camera.quaternion);
    const strafeDirection = new Vector3(move.x, 0, 0).applyQuaternion(camera.quaternion);
    
    direction.addVectors(flyDirection, strafeDirection);
    direction.y += move.z; 
    
    direction.normalize().multiplyScalar(BASE_SPEED * moveSpeed);

    body.current.setLinvel({ x: direction.x, y: direction.y, z: direction.z }, true);

    const bodyPos = body.current.translation();
    camera.position.set(bodyPos.x, bodyPos.y, bodyPos.z);
    
    const euler = new Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    if (euler.z !== 0) {
        euler.z = 0;
        camera.quaternion.setFromEuler(euler);
    }
  });

  return (
    <RigidBody 
      ref={body} 
      colliders={false} 
      mass={1} 
      type="dynamic" 
      position={[0, 2, 5]} 
      enabledRotations={[false, false, false]} 
      gravityScale={0}
      linearDamping={4} 
    >
      <CapsuleCollider args={[0.5, 0.5]} />
    </RigidBody>
  );
}
