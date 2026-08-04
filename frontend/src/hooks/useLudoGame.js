import { useState, useEffect, useCallback, useRef } from 'react';
import { EVENTS, TOAST_MESSAGES } from '../utils/constants';

export const useLudoGame = (socket) => {
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState({});
  const [currentTurn, setCurrentTurn] = useState(null);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [canRoll, setCanRoll] = useState(false);
  const [winner, setWinner] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const playerIdRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Game state update
    socket.on(EVENTS.GAME_STATE, (state) => {
      setGameState(state);
      setPlayers(state.players);
      setCurrentTurn(state.currentTurn);
      setWinner(state.winner);
      
      // Check if it's my turn
      if (playerIdRef.current) {
        setIsMyTurn(state.currentTurn === playerIdRef.current);
      }
      
      // Update roll eligibility
      const currentPlayer = state.players[state.currentTurn];
      if (currentPlayer && currentPlayer.id === playerIdRef.current) {
        setCanRoll(!currentPlayer.hasRolledThisTurn && state.status === 'ACTIVE');
      } else {
        setCanRoll(false);
      }
    });

    // Dice rolled
    socket.on(EVENTS.DICE_ROLLED, ({ value, canMove, invalid }) => {
      setIsRolling(false);
      setDiceValue(value);
      
      if (invalid) {
        setToastMessage(TOAST_MESSAGES.THREE_SIXES);
        return;
      }
      
      if (value === 6) {
        setToastMessage(TOAST_MESSAGES.ROLL_SIX);
      }
      
      // Check if I can move
      const currentPlayer = gameState?.players[gameState?.currentTurn];
      if (currentPlayer?.id === playerIdRef.current) {
        setCanRoll(false);
        if (!canMove) {
          setToastMessage(TOAST_MESSAGES.NO_MOVES);
          setTimeout(() => setToastMessage(null), 3000);
        }
      }
    });

    // Token moved
    socket.on(EVENTS.TOKEN_MOVED, ({ playerId, tokenId, from, to, isHome, killed }) => {
      setIsMoving(false);
      setSelectedToken(null);
      
      if (isHome) {
        setToastMessage(TOAST_MESSAGES.HOME);
      }
      
      if (killed) {
        setToastMessage(TOAST_MESSAGES.KILL);
      }
      
      // Update game state
      setGameState(prev => {
        if (!prev) return prev;
        const newState = { ...prev };
        const player = newState.players[playerId];
        if (player) {
          const token = player.tokens.find(t => t.id === tokenId);
          if (token) {
            token.position = to;
            token.isActive = to !== -1;
            if (isHome) {
              token.isFinished = true;
              player.finishedTokens++;
            }
          }
        }
        return newState;
      });
    });

    // Token killed
    socket.on(EVENTS.TOKEN_KILLED, ({ killerId, victimId }) => {
      // Update game state to reflect killed token
      setGameState(prev => {
        if (!prev) return prev;
        const newState = { ...prev };
        const victim = newState.players[victimId];
        if (victim) {
          // Find and reset the killed token
          const killedToken = victim.tokens.find(t => !t.isActive && t.position === -1);
          if (killedToken) {
            killedToken.position = -1;
          }
        }
        return newState;
      });
    });

    // Turn changed
    socket.on(EVENTS.TURN_CHANGED, ({ playerId, extraTurn }) => {
      setCurrentTurn(playerId);
      setDiceValue(null);
      setIsRolling(false);
      setIsMoving(false);
      
      if (playerIdRef.current) {
        setIsMyTurn(playerId === playerIdRef.current);
        setCanRoll(playerId === playerIdRef.current);
      }
      
      if (!extraTurn) {
        setToastMessage(`It's ${gameState?.players[playerId]?.name || 'someone else'}'s turn`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    });

    // Game started
    socket.on(EVENTS.GAME_STARTED, () => {
      setToastMessage('🎮 Game started! Good luck!');
      setTimeout(() => setToastMessage(null), 3000);
    });

    // Game finished
    socket.on(EVENTS.GAME_FINISHED, ({ winnerId }) => {
      setWinner(winnerId);
      const isWinner = winnerId === playerIdRef.current;
      setToastMessage(isWinner ? TOAST_MESSAGES.WIN : TOAST_MESSAGES.LOSE);
    });

    // Error handling
    socket.on(EVENTS.ERROR, ({ message }) => {
      setToastMessage(`⚠️ ${message}`);
      setTimeout(() => setToastMessage(null), 5000);
      setIsRolling(false);
      setIsMoving(false);
    });

    return () => {
      socket.off(EVENTS.GAME_STATE);
      socket.off(EVENTS.DICE_ROLLED);
      socket.off(EVENTS.TOKEN_MOVED);
      socket.off(EVENTS.TOKEN_KILLED);
      socket.off(EVENTS.TURN_CHANGED);
      socket.off(EVENTS.GAME_STARTED);
      socket.off(EVENTS.GAME_FINISHED);
      socket.off(EVENTS.ERROR);
    };
  }, [socket, gameState]);

  // Join game
  const joinGame = useCallback((roomId, playerName, color) => {
    if (!socket) return;
    socket.emit(EVENTS.JOIN_GAME, { roomId, playerName, color });
    // Store player ID when we get it
    socket.once('joinSuccess', ({ player }) => {
      playerIdRef.current = player.id;
    });
  }, [socket]);

  // Leave game
  const leaveGame = useCallback(() => {
    if (!socket) return;
    socket.emit(EVENTS.LEAVE_GAME);
    playerIdRef.current = null;
  }, [socket]);

  // Toggle ready
  const toggleReady = useCallback(() => {
    if (!socket) return;
    socket.emit(EVENTS.TOGGLE_READY);
  }, [socket]);

  // Roll dice
  const rollDice = useCallback(() => {
    if (!socket || !isMyTurn || isRolling || isMoving) return;
    setIsRolling(true);
    socket.emit(EVENTS.ROLL_DICE);
  }, [socket, isMyTurn, isRolling, isMoving]);

  // Move token
  const moveToken = useCallback((tokenId) => {
    if (!socket || !isMyTurn || isMoving) return;
    setIsMoving(true);
    setSelectedToken(tokenId);
    socket.emit(EVENTS.MOVE_TOKEN, { tokenId });
  }, [socket, isMyTurn, isMoving]);

  return {
    gameState,
    players,
    currentTurn,
    diceValue,
    isRolling,
    isMoving,
    selectedToken,
    canRoll,
    winner,
    toastMessage,
    isMyTurn,
    playerId: playerIdRef.current,
    joinGame,
    leaveGame,
    toggleReady,
    rollDice,
    moveToken
  };
};
