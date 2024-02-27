import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import { PhaserRef } from '../App'
import { EventBus } from './EventBus'
import StartGame from './main'

export const PhaserGame = forwardRef<PhaserRef, { currentActiveScene: (scene: PhaserRef['scene']) => void }>(
  ({ currentActiveScene }, ref) => {
    const game = useRef<Phaser.Game>()

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {
      if (game.current === undefined) {
        game.current = StartGame('game-container')

        if (ref !== null && typeof ref !== 'function') {
          ref.current = { game: game.current, scene: null }
        }
      }

      return () => {
        if (game.current) {
          game.current.destroy(true)
          game.current = undefined
        }
      }
    }, [ref])

    useEffect(() => {
      EventBus.on('current-scene-ready', (currentScene: PhaserRef['scene']) => {
        if (typeof ref === 'function' || ref === null || ref.current === null) return

        if (currentActiveScene instanceof Function) {
          currentActiveScene(currentScene)
          ref.current.scene = currentScene
        }
      })

      return () => {
        EventBus.removeListener('current-scene-ready')
      }
    }, [currentActiveScene, ref])

    return <div id="game-container"></div>
  }
)
