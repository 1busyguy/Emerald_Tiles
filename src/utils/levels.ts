// src/utils/levels.ts
import { TileData } from "../models/TileData";

interface Level {
   levelNumber: number;
  tiles: TileData[]
   startPosition: {x:number, y:number}
}

export const LEVELS: Level[] = [
   {
      levelNumber: 1,
      startPosition: {x:0, y:1},
     tiles: [
        {
            id: '1', type: 'highway', speed: 4, rotation: 0, x: 0, y: 1,
        },
       {
            id: '2', type: 'highway', speed: 4, rotation: 0, x: 0, y: 0,
        },
      {
           id: '3', type: 'highway', speed: 4, rotation: 0, x: 0, y: -1,
      },
     ]
   },
   {
      levelNumber: 2,
       startPosition: {x:0, y:1},
        tiles: [
         {
           id: '4', type: 'highway', speed: 4, rotation: 0, x: 0, y: 1,
         },
        {
           id: '5', type: 'highway', speed: 4, rotation: Math.PI / 2, x: 1, y: 1,
      },
        {
           id: '6', type: 'highway', speed: 4, rotation: Math.PI, x: 1, y: 0,
        },
      {
         id: '7', type: 'highway', speed: 4, rotation: Math.PI / 2, x: 0, y: 0,
      },
     {
          id: '8', type: 'highway', speed: 4, rotation: 0, x: 0, y: -1,
        },
      ]
    },
  {
        levelNumber: 3,
        startPosition: {x:1, y:1},
       tiles: [
          {
              id: '9', type: 'highway', speed: 4, rotation: Math.PI / 2, x: 1, y: 1,
         },
         {
             id: '10', type: 'highway', speed: 4, rotation: Math.PI , x: 1, y: 0,
          },
           {
              id: '11', type: 'highway', speed: 4, rotation: Math.PI/2 , x: 2, y: 0,
          },
         {
             id: '12', type: 'highway', speed: 4, rotation: 0, x: 2, y: -1,
          },
           {
            id: '13', type: 'highway', speed: 4, rotation: Math.PI / 2, x: 1, y: -1,
           },
          {
              id: '14', type: 'highway', speed: 4, rotation: 0, x: 0, y: -1,
         }
      ]
   },
    //... add more levels
];