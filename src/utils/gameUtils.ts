// src/utils/gameUtils.ts
import * as THREE from 'three';
import { TILE_SIZE, TILE_SPEEDS, TILE_TYPES, MARBLE_RADIUS } from './constants';
import { TileData } from '../models/TileData';
import { v4 as uuidv4 } from 'uuid';

export function createTileMesh(tileData: TileData): THREE.Mesh {
    const tileGeometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
    const tileTexture = new THREE.TextureLoader().load(`/assets/images/${tileData.type}.png`)
    const tileMaterial = new THREE.MeshBasicMaterial({map: tileTexture});
    const tileMesh = new THREE.Mesh(tileGeometry, tileMaterial);
    tileMesh.rotation.z = tileData.rotation;
    tileMesh.position.set(tileData.x, tileData.y, 0);
      // create a canvas to draw the line
        const canvas = document.createElement('canvas');
        canvas.width = 256;
         canvas.height = 256;
        const context = canvas.getContext('2d')
       if(context){
         context.clearRect(0,0, canvas.width, canvas.height) //clear the previous rendering
           context.lineWidth = 10;
            context.strokeStyle = 'black';
             context.beginPath();
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
           if (tileData.pathType === 'straight') {
             context.moveTo(centerX, 0);
               context.lineTo(centerX, canvas.height);
           } else if (tileData.pathType === 'curve') {
               context.moveTo(centerX,0);
             context.bezierCurveTo(canvas.width, 0, canvas.width, canvas.height, canvas.width, centerY)
            }
             context.stroke();
              const texture = new THREE.CanvasTexture(canvas);
           const pathMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true })
          const pathPlane = new THREE.Mesh(tileGeometry, pathMaterial);
         pathPlane.position.set(tileData.x, tileData.y, 0.1)
           tileMesh.add(pathPlane);
        }
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
    const pathType = Math.floor(Math.random() * 2) === 0 ? 'straight' : 'curve'
      tiles.push({
        id: uuidv4(),
        type,
          speed: TILE_SPEEDS[type as keyof typeof TILE_SPEEDS],
          rotation,
        x,
        y,
        pathType
      });
    }
  return tiles;
}