// src/components/TileSelector.tsx
import React from 'react';
import { TileData } from '../models/TileData';

interface TileSelectorProps {
  availableTiles: TileData[];
  onTileSelect: (tile: TileData) => void;
}

const TileSelector: React.FC<TileSelectorProps> = ({ availableTiles, onTileSelect }) => {
  return (
    <div className="flex space-x-4">
      {availableTiles.map((tile) => (
        <div key={tile.id} className="border p-2 cursor-pointer" onClick={() => onTileSelect(tile)}>
        <img src={`/assets/images/${tile.type}.png`} alt={tile.type} className='w-10 h-10'/>
        </div>
      ))}
    </div>
  );
};

export default TileSelector;