import { useRef, useState } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface HotspotMarkerProps {
  position: [number, number, number];
  type: 'quest' | 'crate';
  onClick: () => void;
  isSelected?: boolean;
}

export function HotspotMarker({ position, type, onClick, isSelected = false }: HotspotMarkerProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // Quest markers are scrolls (orange), Crate markers are treasure chests (gold)
  const color = type === 'quest' ? '#ff6b35' : '#ffd700';
  const emissive = type === 'quest' ? '#ff6b35' : '#ffd700';
  const scale = isSelected ? 1.3 : hovered ? 1.2 : 1.0;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={scale}
      >
        {type === 'quest' ? (
          // Scroll-like shape for quests
          <>
            <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={isSelected ? 0.8 : hovered ? 0.6 : 0.3}
              metalness={0.3}
              roughness={0.4}
            />
          </>
        ) : (
          // Box-like shape for crates
          <>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial
              color={color}
              emissive={emissive}
              emissiveIntensity={isSelected ? 0.8 : hovered ? 0.6 : 0.3}
              metalness={0.6}
              roughness={0.2}
            />
          </>
        )}
      </mesh>
      
      {/* Glow ring effect */}
      {(hovered || isSelected) && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}
