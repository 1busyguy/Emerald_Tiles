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
const tileMeshRef = useRef<THREE.Mesh | null>(null);
const tileDivRef = useRef<HTMLDivElement | null>(null)


useEffect(() => {
 if (tileMeshRef.current) return;
 tileMeshRef.current = createTileMesh(tileData);
 const texture = (tileMeshRef.current?.children[0]?.children[0] as THREE.Mesh)?.material as THREE.MeshBasicMaterial;
 if(texture && tileDivRef.current && texture.map instanceof THREE.CanvasTexture){
      tileDivRef.current.appendChild(texture.map.image)
   }
},[tileData])

const handleRotate = () => {
 onRotate(tileData.id);
};

return (
 <div ref={tileDivRef} onClick={handleRotate}>
 </div>
);
};

export default Tile;