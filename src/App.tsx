// src/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import Tile from './components/Tile';
import TileSelector from './components/TileSelector';
import Timer from './components/Timer';
import { generateRandomTiles, createMarbleMesh, createTileMesh } from './utils/gameUtils';
import { INITIAL_TIMER, TILE_SIZE } from './utils/constants';
import { TileData } from './models/TileData';
import GameOverModal from './components/GameOverModal';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [availableTiles, setAvailableTiles] = useState<TileData[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timer, setTimer] = useState(INITIAL_TIMER);
    const [availablePositions, setAvailablePositions] = useState<TileData[]>([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
    const [selectedTile, setSelectedTile] = useState<TileData | null>(null);
  const [marble, setMarble] = useState<THREE.Mesh | null>(null);
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
         camera.position.set(8, 8, 12);
         camera.lookAt(0, 0, 0);
        const levelSize = 2;
        const initialPositions: TileData[] = [];
        const generatedTiles = generateRandomTiles(currentLevel);
        setTiles(generatedTiles);

        //Create Line outlines to show available positions.
         const lineMaterial = new THREE.LineBasicMaterial({ color: 0x808080 }); // Gray
        for(let x = -levelSize; x<=levelSize; x++) {
         for (let y = -levelSize; y <= levelSize; y++){
           if(x === 0 && y === 0){
                continue;
           }
            let newTilePosition = {id: uuidv4(), type:'', speed:0, x,y, rotation: 0}
            initialPositions.push(newTilePosition);
             // Create vertices for the outline of the tile
             const points = [];
            points.push( new THREE.Vector3( x-TILE_SIZE/2, y-TILE_SIZE/2, 0.1 ) );
           points.push( new THREE.Vector3( x + TILE_SIZE/2, y - TILE_SIZE/2, 0.1 ) );
           points.push( new THREE.Vector3( x + TILE_SIZE/2, y + TILE_SIZE/2, 0.1 ) );
          points.push( new THREE.Vector3( x - TILE_SIZE/2, y + TILE_SIZE/2, 0.1 ) );
           points.push( new THREE.Vector3( x-TILE_SIZE/2, y-TILE_SIZE/2, 0.1 ) );

           const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
           const line = new THREE.Line(lineGeometry, lineMaterial)
           scene.add(line)
        }
      }

        setAvailablePositions(initialPositions)
      generatedTiles.forEach((tile) => {
            const tileMesh =  createTileMesh(tile)
              scene.add(tileMesh);
        });
        let randomTileX = generatedTiles[0].x
        let randomTileY = generatedTiles[0].y
        const marbleMesh = createMarbleMesh(randomTileX, randomTileY)
        setMarble(marbleMesh);
        scene.add(marbleMesh);
        const animate = () => {
            if (gameOver) return;
            renderer.render(scene, camera)
            requestAnimationFrame(animate)
            if(!isTimerRunning){
                marbleMovement();
            }
        }
        animate()
        return () => {
            renderer.dispose()
        };
    }, [currentLevel, gameOver, isTimerRunning]);


    const handleTimerEnd = () => {
        setIsTimerRunning(false);
        setAvailableTiles(generateRandomTiles(currentLevel));
    };

    const handleTileRotate = (id: string) => {
        setTiles((prevTiles) => prevTiles.map(tile =>{
            if (tile.id === id){
                const newRotation = tile.rotation + Math.PI/2;
                return{...tile, rotation: newRotation}
            }
            return tile;
        })
        )
        if (sceneRef.current){
            sceneRef.current.children.forEach(mesh => {
                if ((mesh as THREE.Mesh).geometry instanceof THREE.PlaneGeometry && mesh.name === id){
                    mesh.rotation.z = mesh.rotation.z + Math.PI/2
                }
            }
            )
        }
    };

    const handleTileSelect = (tile: TileData) => {
         setSelectedTile(tile);
    }


    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if(!selectedTile || isTimerRunning) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const x = (mouseX / canvas.offsetWidth) * 2 - 1;
        const y = - (mouseY / canvas.offsetHeight) * 2 + 1;

        if(sceneRef.current && cameraRef.current) {
            const raycaster = new THREE.Raycaster();
            const mouseVector = new THREE.Vector2(x, y);
            raycaster.setFromCamera(mouseVector, cameraRef.current);

            const intersects = raycaster.intersectObjects(sceneRef.current.children, false);

            if (intersects.length > 0) {
                const firstIntersection = intersects[0];
                handleTileDrop(selectedTile, firstIntersection.point);
                setSelectedTile(null)
            }
        }
    }


    const handleRestart = () => {
        setGameOver(false);
        setCurrentLevel(1)
        setIsTimerRunning(true);
        setTimer(INITIAL_TIMER);
        setTiles([])
    }

    const marbleMovement = () => {
        if (!marble || !sceneRef.current) return;
        let currentTile;
        if (tiles && tiles.length > 0){
            let minDistance = Number.MAX_VALUE;
            tiles.forEach(tile => {
                const dx = marble.position.x - tile.x;
                const dy = marble.position.y - tile.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < minDistance){
                    minDistance = distance;
                    currentTile = tile;
                }
            })
        }
        if (!currentTile) return;
        const nextX = currentTile.x;
        const nextY = currentTile.y;
        const speed = currentTile.speed / 20;
        const dx = nextX - marble.position.x;
        const dy = nextY - marble.position.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if(distance > 0.1){
            marble.position.x += (dx / distance) * speed
            marble.position.y += (dy / distance) * speed
        }
        if(marble.position.y < -5) {
            setGameOver(true);
        }
    }

    const handleTileDrop = (selectedTile: TileData, dropPosition: THREE.Vector3) => {
        if (!selectedTile || !sceneRef.current) return;
         const newX = Math.round(dropPosition.x)
        const newY = Math.round(dropPosition.y)
        if(isValidDropPosition({x: newX, y:newY})){
            setTiles((prevTiles) => [...prevTiles, {...selectedTile, x: newX, y: newY}]);
             setAvailableTiles(prevTiles => prevTiles.filter(tile => tile.id !== selectedTile.id));
             setAvailablePositions(prevPositions => prevPositions.filter(position => position.x !== newX || position.y !== newY))
             if (sceneRef.current){
                  const tileMesh =  createTileMesh({...selectedTile, x: newX, y: newY});
                  sceneRef.current.add(tileMesh)
            }
        }
    };

    const isValidDropPosition = (dropPosition: {x:number, y:number}) => {
       return availablePositions.some(position => position.x === dropPosition.x && position.y === dropPosition.y)
    }


    return (
        <div className="flex flex-col items-center">
            <canvas ref={canvasRef} className="border border-gray-300 my-4" onClick={handleCanvasClick} />
            {isTimerRunning ? (
                <Timer initialTime={timer} onTimerEnd={handleTimerEnd} />
            ) : (
                <TileSelector availableTiles={availableTiles} onTileSelect={handleTileSelect} />
            )}
            <div className="grid grid-cols-5 gap-2">
                {tiles.map((tile) => (
                    <Tile key={tile.id} tileData={tile} onRotate={handleTileRotate} />
                ))}
            </div>
            <GameOverModal isOpen={gameOver} onRestart={handleRestart}/>
        </div>
    );
};

export default App;