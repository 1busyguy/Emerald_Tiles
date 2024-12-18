// src/components/Tile.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TileData } from '../models/TileData';
import { createTileMesh } from '../utils/gameUtils';

interface TileProps {
  tileData: TileData;
  onRotate: (id: string) => void;
}

const Tile: React.FC<TileProps> = ({ tileData, onRotate }) => {
  const tileRef = useRef<THREE.Mesh | null>(null);
  
  useEffect(() => {
     if (tileRef.current) return;
     tileRef.current = createTileMesh(tileData);
  },[tileData])


  const handleRotate = () => {
    onRotate(tileData.id);
  };

  return (
    <mesh ref={tileRef} onClick={handleRotate}>
        
    </mesh>
  );
};

export default Tile;