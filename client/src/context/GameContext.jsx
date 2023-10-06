import { useState, useCallback, createContext } from 'react';

const GameContext = createContext();
const GameProvider = ({ children }) => {
  const [room, setRoom] = useState("");
  const [orientation, setOrientation] = useState("");
  const [players, setPlayers] = useState([]);

  const handleCleanup = useCallback(() => {
      setRoom("");
      setOrientation("");
      setPlayers([]);
  }, []);
  
  const handleRoomChange = (room) => {
    setRoom(room);
  }
  const handlePlayersChange = (players) => {
    setPlayers(players);
  }
  const handleOrientationChange = (orientation) => {
    setOrientation(orientation);
  }

  return (
    <GameContext.Provider value={{room, players, orientation, handleRoomChange, handlePlayersChange, handleOrientationChange, handleCleanup}}>
      {children}
    </GameContext.Provider>
  );
};