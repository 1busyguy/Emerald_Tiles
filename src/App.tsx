// src/utils/gameUtils.ts
import * as THREE from 'three';
import { TILE_SIZE, TILE_SPEEDS, TILE_TYPES, MARBLE_RADIUS } from "./utils/constants";
import { TileData } from './models/TileData';
import { v4 as uuidv4 } from 'uuid';

export function createTileMesh(tileData: TileData): THREE.Mesh {
    const tileGeometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
    const tileTexture = new THREE.TextureLoader().load(`/assets/images/${tileData.type}.png`)
    const tileMaterial = new THREE.MeshBasicMaterial({map: tileTexture});
    const tileMesh = new THREE.Mesh(tileGeometry, tileMaterial);
    tileMesh.rotation.z = tileData.rotation;
    tileMesh.position.set(tileData.x, tileData.y, 0);
    return tileMesh;
}

  export function createMarbleMesh(x: number, y: number): THREE.Mesh {
    const marbleGeometry = new THREE.SphereGeometry(MARBLE_RADIUS, 32, 16);
    const marbleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Green color
    const marbleMesh = new THREE.Mesh(marbleGeometry, marbleMaterial);
    marbleMesh.position.set(x, y, 0.2);
    return marbleMesh;
  }

export function generateRandomTiles(currentLevel: number): TileData[] {
    const tileCount = currentLevel <= 5 ? 9 : Math.floor(Math.random() * 20) + 10;
    const tiles: TileData[] = [];

    for(let i = 0; i < tileCount; i++) {
    const x = Math.floor(Math.random() * 10) - 5;
    const y = Math.floor(Math.random() * 10) - 5;
    const randomTypeIndex = Math.floor(Math.random() * TILE_TYPES.length);
    const type = TILE_TYPES[randomTypeIndex];
    const rotation = Math.floor(Math.random() * 4) * (Math.PI / 2);
      tiles.push({
        id: uuidv4(),
        type,
          speed: TILE_SPEEDS[type as keyof typeof TILE_SPEEDS],
          rotation,
        x,
        y,
      });
    }
  return tiles;
}