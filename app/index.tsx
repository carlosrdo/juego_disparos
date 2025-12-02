import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Game, GameState } from '@/game';

// Import SVG assets
const playerImage = require('@/assets/player.svg');
const triangleImage = require('@/assets/triangle.svg');
const bossImage = require('@/assets/boss.svg');
const starImage = require('@/assets/star.svg');
const shotPlayerImage = require('@/assets/shot_player.svg');
const shotEnemyImage = require('@/assets/shot_enemy.svg');
const gameOverImage = require('@/assets/game_over.svg');
const youWinImage = require('@/assets/you_win.svg');

const imageMap: Record<string, any> = {
  player: playerImage,
  triangle: triangleImage,
  boss: bossImage,
  star: starImage,
  shot_player: shotPlayerImage,
  shot_enemy: shotEnemyImage,
};

export default function GameScreen() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const gameRef = useRef<Game | null>(null);

  const onLayout = useCallback((event: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
    if (gameRef.current) {
      gameRef.current.setDimensions(width, height);
    }
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      if (!gameRef.current) {
        const game = new Game(dimensions.width, dimensions.height);
        game.setOnStateChange(setGameState);
        gameRef.current = game;
        setGameState(game.getState());
      }
    }

    return () => {
      gameRef.current?.destroy();
    };
  }, [dimensions.width, dimensions.height]);

  // Handle keyboard events for web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current?.isRunning()) return;
      
      if (e.key === 'ArrowLeft') {
        gameRef.current.movePlayer('left');
      } else if (e.key === 'ArrowRight') {
        gameRef.current.movePlayer('right');
      } else if (e.key === ' ') {
        e.preventDefault();
        gameRef.current.addShot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startGame = useCallback(() => {
    gameRef.current?.start();
  }, []);

  const handleShoot = useCallback(() => {
    gameRef.current?.addShot();
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (gameRef.current && dimensions.width > 0) {
        gameRef.current.movePlayerTo(e.x);
      }
    })
    .runOnJS(true);

  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      handleShoot();
    })
    .runOnJS(true);

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Space Survivor</Text>
        <Text style={styles.subtitle}>
          Defeat the triangle, then face the final boss!
        </Text>
      </View>

      <View style={styles.gameContainerWrapper}>
        <GestureDetector gesture={composedGesture}>
          <View style={styles.gameContainer} onLayout={onLayout}>
            {/* HUD */}
            <View style={styles.hud}>
              <Text style={styles.hudText}>Score: {gameState?.score ?? 0}</Text>
              <Text style={styles.hudText}>Lives: {gameState?.lives ?? 0}</Text>
            </View>

            {/* Game entities */}
            {gameState?.player && !gameState.player.dead && (
              <Image
                source={imageMap[gameState.player.imageKey]}
                style={[
                  styles.entity,
                  {
                    left: gameState.player.x,
                    top: gameState.player.y,
                    width: gameState.player.width,
                    height: gameState.player.height,
                  },
                ]}
              />
            )}

            {gameState?.player?.dead && (
              <Image
                source={imageMap.star}
                style={[
                  styles.entity,
                  {
                    left: gameState.player.x,
                    top: gameState.player.y,
                    width: gameState.player.width,
                    height: gameState.player.height,
                  },
                ]}
              />
            )}

            {gameState?.opponent && (
              <Image
                source={imageMap[gameState.opponent.imageKey]}
                style={[
                  styles.entity,
                  {
                    left: gameState.opponent.x,
                    top: gameState.opponent.y,
                    width: gameState.opponent.width,
                    height: gameState.opponent.height,
                  },
                ]}
              />
            )}

            {gameState?.shots.map((shot, index) => (
              <Image
                key={`shot-${index}`}
                source={imageMap[shot.imageKey]}
                style={[
                  styles.entity,
                  {
                    left: shot.x,
                    top: shot.y,
                    width: shot.width,
                    height: shot.height,
                  },
                ]}
              />
            ))}

            {gameState?.opponentShots.map((shot, index) => (
              <Image
                key={`opp-shot-${index}`}
                source={imageMap[shot.imageKey]}
                style={[
                  styles.entity,
                  {
                    left: shot.x,
                    top: shot.y,
                    width: shot.width,
                    height: shot.height,
                  },
                ]}
              />
            ))}

            {/* Start Screen */}
            {gameState?.showStartScreen && (
              <View style={styles.overlay}>
                <Text style={styles.overlayTitle}>Welcome!</Text>
                <Text style={styles.overlayText}>Use Arrow Keys to Move.</Text>
                <Text style={styles.overlayText}>Press Space to Shoot.</Text>
                <Text style={styles.overlayText}>
                  On mobile: Drag to move, Tap to shoot.
                </Text>
                <Pressable style={styles.button} onPress={startGame}>
                  <Text style={styles.buttonText}>Start Game</Text>
                </Pressable>
              </View>
            )}

            {/* Game Over Screen */}
            {gameState?.showGameOverScreen && (
              <View style={styles.overlay}>
                <Image
                  source={gameState.didWin ? youWinImage : gameOverImage}
                  style={styles.gameOverImage}
                  resizeMode="contain"
                />
                <Pressable style={styles.button} onPress={startGame}>
                  <Text style={styles.buttonText}>Play Again</Text>
                </Pressable>
              </View>
            )}
          </View>
        </GestureDetector>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Touchscreen: Drag to move, Tap to shoot.
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#7DF9FF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  gameContainerWrapper: {
    width: '100%',
    maxWidth: 800,
    aspectRatio: 4 / 3,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(75, 42, 110, 0.5)',
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  hudText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7DF9FF',
  },
  entity: {
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  overlayTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7DF9FF',
    marginBottom: 16,
  },
  overlayText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  gameOverImage: {
    width: '60%',
    height: 100,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#7DF9FF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B2A6E',
  },
  footer: {
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
