import GameEngine from '../game/GameEngine';

describe('Game Engine Tests', () => {
  let engine;
  let mockGameState;

  beforeEach(() => {
    engine = new GameEngine();
    mockGameState = {
      players: {
        player1: {
          id: 'player1',
          color: 'RED',
          tokens: [
            { id: 0, position: -1, isActive: false, isFinished: false },
            { id: 1, position: 10, isActive: true, isFinished: false },
            { id: 2, position: 51, isActive: true, isFinished: false },
            { id: 3, position: 57, isActive: true, isFinished: true }
          ],
          finishedTokens: 1
        },
        player2: {
          id: 'player2',
          color: 'GREEN',
          tokens: [
            { id: 0, position: 8, isActive: true, isFinished: false },
            { id: 1, position: 12, isActive: true, isFinished: false }
          ],
          finishedTokens: 0
        }
      },
      status: 'ACTIVE',
      currentTurn: 'player1'
    };
  });

  test('Token in base can only move with dice 6', () => {
    const result = engine.validateMove(
      mockGameState.players.player1,
      0, // Token in base
      6
    );
    expect(result.valid).toBe(true);
    expect(result.newPosition).toBe(0); // RED start position
  });

  test('Token in base cannot move without dice 6', () => {
    const result = engine.validateMove(
      mockGameState.players.player1,
      0, // Token in base
      5
    );
    expect(result.valid).toBe(false);
  });

  test('Token on path moves correctly', () => {
    const result = engine.validateMove(
      mockGameState.players.player1,
      1, // Token at position 10
      4
    );
    expect(result.valid).toBe(true);
    expect(result.newPosition).toBe(14);
  });

  test('Token entering home column', () => {
    const result = engine.validateMove(
      mockGameState.players.player1,
      2, // Token at position 51 (RED home entry)
      3
    );
    expect(result.valid).toBe(true);
    expect(result.newPosition).toBe(54); // 52 + (3-1) = 54
  });

  test('Token overshooting home is invalid', () => {
    const result = engine.validateMove(
      mockGameState.players.player1,
      2, // Token at position 51 (RED home entry)
      7
    );
    expect(result.valid).toBe(false);
  });

  test('Kill detection on non-safe position', () => {
    const kills = engine.checkForKills(
      mockGameState.players,
      'player1',
      'RED',
      8 // Position 8 is safe zone
    );
    expect(kills.length).toBe(0);
  });

  test('Kill detection on safe position', () => {
    // Move player2 token to a non-safe position
    mockGameState.players.player2.tokens[0].position = 10;
    
    const kills = engine.checkForKills(
      mockGameState.players,
      'player1',
      'RED',
      10 // Same position as player2's token
    );
    expect(kills.length).toBe(1);
    expect(kills[0].playerId).toBe('player2');
  });

  test('Three consecutive sixes loses turn', () => {
    const player = mockGameState.players.player1;
    const result = engine.processTurn(player, 6, 2); // Third consecutive six
    expect(result.turnLost).toBe(true);
    expect(result.consecutiveSixes).toBe(0);
  });

  test('No valid moves skips turn', () => {
    // Mock player with all tokens finished
    const player = {
      tokens: [
        { position: 57, isFinished: true },
        { position: 57, isFinished: true },
        { position: 57, isFinished: true },
        { position: 57, isFinished: true }
      ]
    };
    
    const result = engine.processTurn(player, 3, 0);
    expect(result.turnLost).toBe(true);
  });

  test('Calculate next turn correctly', () => {
    const nextTurn = engine.getNextTurn(
      mockGameState.players,
      'player1',
      false
    );
    expect(nextTurn).toBe('player2');
  });

  test('Keep turn on extra turn', () => {
    const nextTurn = engine.getNextTurn(
      mockGameState.players,
      'player1',
      true
    );
    expect(nextTurn).toBe('player1');
  });

  test('Win condition detection', () => {
    // Give player1 all 4 tokens home
    mockGameState.players.player1.finishedTokens = 4;
    const winner = engine.checkGameWinner(mockGameState.players);
    expect(winner).toBe('player1');
  });

  test('Edge case: token in home column moving exactly to home', () => {
    const result = engine.calculateNewPosition(54, 3, 'RED');
    expect(result).toBe(57); // 54 + 3 = 57 (HOME)
  });

  test('Edge case: token in home column overshooting home', () => {
    const result = engine.calculateNewPosition(54, 4, 'RED');
    expect(result).toBe(null);
  });
});
