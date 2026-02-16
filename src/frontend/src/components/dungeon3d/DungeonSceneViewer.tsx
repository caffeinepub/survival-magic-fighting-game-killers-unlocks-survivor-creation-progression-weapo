import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { HotspotMarker } from './HotspotMarker';
import { HotspotData } from './dungeonHotspots';
import { Loader2 } from 'lucide-react';

interface DungeonSceneViewerProps {
  hotspots: HotspotData[];
  selectedHotspot: bigint | null;
  onHotspotClick: (id: bigint, type: 'quest' | 'crate') => void;
  onLoadError?: () => void;
}

function DungeonEnvironment() {
  return (
    <>
      {/* Ambient lighting for overall scene */}
      <ambientLight intensity={0.3} />
      
      {/* Main directional light (simulating torch/fire light) */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        color="#ff9966"
        castShadow
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.4}
        color="#6699ff"
      />
      
      {/* Point light for dramatic effect */}
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#ffaa44" distance={10} />
    </>
  );
}

function DungeonFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#2a2520"
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
}

function DungeonWalls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 2, -5]} castShadow receiveShadow>
        <boxGeometry args={[20, 6, 0.5]} />
        <meshStandardMaterial color="#3a3530" roughness={0.95} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 6, 0.5]} />
        <meshStandardMaterial color="#3a3530" roughness={0.95} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[10, 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 6, 0.5]} />
        <meshStandardMaterial color="#3a3530" roughness={0.95} />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#2a2520" roughness={0.95} />
      </mesh>
    </group>
  );
}

function DungeonScene({ hotspots, selectedHotspot, onHotspotClick }: Omit<DungeonSceneViewerProps, 'onLoadError'>) {
  return (
    <>
      <DungeonEnvironment />
      <DungeonFloor />
      <DungeonWalls />
      
      {/* Render hotspot markers */}
      {hotspots.map((hotspot) => (
        <HotspotMarker
          key={`${hotspot.type}-${hotspot.id.toString()}`}
          position={hotspot.position}
          type={hotspot.type}
          onClick={() => onHotspotClick(hotspot.id, hotspot.type)}
          isSelected={selectedHotspot === hotspot.id}
        />
      ))}
      
      <Environment preset="night" />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading 3D dungeon...</p>
      </div>
    </div>
  );
}

export function DungeonSceneViewer({ hotspots, selectedHotspot, onHotspotClick, onLoadError }: DungeonSceneViewerProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background/50 rounded-lg border border-destructive/50">
        <div className="text-center p-6 space-y-2">
          <p className="text-destructive font-medium">Failed to load 3D scene</p>
          <p className="text-sm text-muted-foreground">The dungeon viewer encountered an error</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        onCreated={({ gl }) => {
          gl.setClearColor('#1a1816');
        }}
        onError={() => {
          setHasError(true);
          onLoadError?.();
        }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 4, 8]} fov={60} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            target={[0, 1, 0]}
          />
          <DungeonScene
            hotspots={hotspots}
            selectedHotspot={selectedHotspot}
            onHotspotClick={onHotspotClick}
          />
        </Suspense>
      </Canvas>
      <Suspense fallback={<LoadingFallback />} />
    </div>
  );
}
