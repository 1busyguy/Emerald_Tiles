 // src/components/GameOverModal.tsx
 import React from 'react';

 interface GameOverModalProps {
   isOpen: boolean;
   onRestart: () => void;
 }

 const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, onRestart }) => {
   if (!isOpen) {
     return null;
   }

   return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
       <div className="bg-white p-8 rounded-md">
         <h2 className="text-2xl mb-4">Game Over</h2>
         <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={onRestart}>
           Restart
         </button>
       </div>
     </div>
   );
 };

 export default GameOverModal;