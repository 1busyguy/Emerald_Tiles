// src/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import Tile from './components/Tile';
import TileSelector from './components/TileSelector';
import { generateRandomTiles, createMarbleMesh, createTileMesh } from './utils/gameUtils';
import { TILE_SIZE } from './utils/constants';
import { TileData } from './models/TileData';
import GameOverModal from './components/GameOverModal';
import { v4 as uuidv4 } from 'uuid';
import coinImage from '/assets/images/coin.png';
import { LEVELS } from './utils/levels';
import { TILE_TYPES } from './utils/constants';

const App: React.FC = () => {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [availableTiles, setAvailableTiles] = useState<TileData[]>([]);
  const [availablePositions, setAvailablePositions] = useState<TileData[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [coins, setCoins] = useState(0);
  const [marble, setMarble] = useState<THREE.Mesh | null>(null);
    const [floatingMarblePosition, setFloatingMarblePosition] = useState<THREE.Vector3>(new THREE.Vector3(0,0,0))
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        if(gameOver) {
            return;
        }
        const scene = new THREE.Scene();
        const aspectRatio = window.innerWidth/ window.innerHeight;
        const camera = new THREE.OrthographicCamera(-5 * aspectRatio, 5 * aspectRatio, 5, -5, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!});
        sceneRef.current = scene;
        cameraRef.current = camera;
        rendererRef.current = renderer;
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Adjust the camera position for a 3D view
           camera.position.set(10, 10, 12);
            camera.lookAt(0, 0, 0);
          const levelSize = 2;
       const initialPositions: TileData[] = [];
       const currentLevelData = LEVELS.find(level => level.levelNumber === currentLevel);
       if(!currentLevelData) return;
          const generatedTiles: TileData[] = []
        for (let x = -levelSize; x <= levelSize; x++) {
         for (let y = -levelSize; y <= levelSize; y++) {
            if (x === 0 && y === 0) {
               continue;
          }
          const randomTypeIndex = Math.floor(Math.random() * TILE_TYPES.length);
            const type = TILE_TYPES[randomTypeIndex];
             const rotation = Math.floor(Math.random() * 4) * (Math.PI / 2);
            const isoX = (x - y) * (TILE_SIZE / 2);
              const isoY = (x + y) * (TILE_SIZE / 4);
              let newTilePosition = { id: uuidv4(), type, speed: 4, x: isoX, y: isoY, rotation };
          initialPositions.push(newTilePosition);
         generatedTiles.push(newTilePosition)
        }
       }
       setTiles(generatedTiles);
      setAvailablePositions(initialPositions)

         generatedTiles.forEach((tile) => {
         const tileMesh =  createTileMesh(tile)
           scene.add(tileMesh);
      });

          const {x,y} = currentLevelData.startPosition;
     const marbleMesh = createMarbleMesh(x, y);
        marbleMesh.position.z = 1; // Initial z-position above tiles
      setMarble(marbleMesh);
        scene.add(marbleMesh);
        setFloatingMarblePosition(marbleMesh.position);
    const animate = () => {
         if (gameOver) return;
           renderer.render(scene, camera)
             requestAnimationFrame(animate)
          if(marble && marble.position.z > 0.2) {
             marble.position.z -= 0.05
           } else {
            marbleMovement()
           }
       };
       animate()
        return () => {
           renderer.dispose()
         };
  }, [currentLevel, gameOver]);



     const floatMarble = () => {
      if(marble && floatingMarblePosition){
        let floatingSpeed = 0.02
        const newZ = floatingMarblePosition.z + Math.sin(Date.now() / 200) * floatingSpeed
         marble.position.z = newZ;
         }
    }

  const handleTileRotate = (id: string) => {
    setTiles((prevTiles) =>
      prevTiles.map((tile) => {
        if (tile.id === id) {
          const newRotation = tile.rotation + Math.PI / 4;
          return { ...tile, rotation: newRotation };
        }
        return tile;
      })
    );
    if (sceneRef.current) {
      sceneRef.current.children.forEach((mesh) => {
        if ((mesh as THREE.Mesh).geometry instanceof THREE.PlaneGeometry && mesh.name === id) {
          mesh.rotation.z = mesh.rotation.z + Math.PI / 4;
        }
      });
    }
  };

  const handleTileSelect = (tile: TileData) => {
     setSelectedTile(tile);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
   if (!selectedTile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const x = (mouseX / canvas.offsetWidth) * 2 - 1;
    const y = -(mouseY / canvas.offsetHeight) * 2 + 1;

    if (sceneRef.current && cameraRef.current) {
      const raycaster = new THREE.Raycaster();
      const mouseVector = new THREE.Vector2(x, y);
      raycaster.setFromCamera(mouseVector, cameraRef.current);

      const intersects = raycaster.intersectObjects(sceneRef.current.children, false);

      if (intersects.length > 0) {
        const firstIntersection = intersects[0];
        handleTileDrop(selectedTile, firstIntersection.point);
        setSelectedTile(null);
      }
    }
  };

  const handleRestart = () => {
    setGameOver(false);
    setCurrentLevel(1);
    setTiles([]);
  };

  const marbleMovement = () => {
    if (!marble || !sceneRef.current) return;
    let currentTile: TileData | undefined;
    if (tiles && tiles.length > 0) {
      let minDistance = Number.MAX_VALUE;
      tiles.forEach((tile) => {
        const dx = marble.position.x - (tile?.x || 0);
        const dy = marble.position.y - (tile?.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minDistance) {
          minDistance = distance;
          currentTile = tile;
        }
      });
    }
    if (!currentTile) return;
    const {x,y, speed} = currentTile || {x:0, y:0, speed:1};
    const nextX = x;
    const nextY = y;
    const tileSpeed = (speed || 1) / 20;
    const dx = nextX - marble.position.x;
    const dy = nextY - marble.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0.1) {
      marble.position.x += (dx / distance) * tileSpeed;
      marble.position.y += (dy / distance) * tileSpeed;
    }
    if (marble.position.y < -5) {
      setGameOver(true);
    }
  };

  const handleTileDrop = (selectedTile: TileData, dropPosition: THREE.Vector3) => {
    if (!selectedTile || !sceneRef.current) return;
    const newX = Math.round(dropPosition.x);
    const newY = Math.round(dropPosition.y);
    if (isValidDropPosition({ x: newX, y: newY })) {
      setTiles((prevTiles) => [...prevTiles, { ...selectedTile, x: newX, y: newY }]);
        setAvailableTiles((prevTiles) => prevTiles.filter((tile) => tile.id !== selectedTile.id));
         setAvailablePositions((prevPositions) => prevPositions.filter((position) => position.x !== newX || position.y !== newY));
        if (sceneRef.current) {
         const tileMesh = createTileMesh({ ...selectedTile, x: newX, y: newY });
          sceneRef.current.add(tileMesh);
      }
    }
  };

  const isValidDropPosition = (dropPosition: { x: number; y: number }) => {
     return availablePositions.some((position) => position.x === dropPosition.x && position.y === dropPosition.y);
    };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full p-4 border-4 border-green-500">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-left">Emerald Tiles</h1>
          <div className="flex items-center">
            <span className="mr-2">
              <img src={coinImage} alt="Golden Coin" className="w-6 h-6" />
            </span>
            <span>{coins}</span>
          </div>
        </header>
          <div className="flex justify-center items-center mb-4">
          </div>
        <canvas ref={canvasRef} className="border border-gray-300 my-4" onClick={handleCanvasClick} />
         <TileSelector availableTiles={availableTiles} onTileSelect={handleTileSelect} />
        <div className="grid grid-cols-5 gap-2">
          {tiles.map((tile) => (
            <Tile key={tile.id} tileData={tile} onRotate={handleTileRotate} />
          ))}
        </div>
        <GameOverModal isOpen={gameOver} onRestart={handleRestart} />
      </div>
    </div>
  );
};

export default App;