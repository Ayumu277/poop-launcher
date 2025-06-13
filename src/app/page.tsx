'use client'

import { useEffect, useRef, useState } from 'react'
import { translations, Language } from './translations'

type GameState = 'ready' | 'playing' | 'flying' | 'wine-monkey' | 'sapphire-duo' | 'ruby-monkey' | 'golden-monkey' | 'diamond-monkey' | 'result'

interface PoopState {
  angle: number
  speed: number
  baseRadius: number
  amplitude: number
}

interface Projectile {
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  displayY?: number
}

interface BackgroundElement {
  x: number
  y: number
  emoji: string
  type: 'grass' | 'cloud' | 'animal'
}

// Extend the ScreenOrientation interface for TypeScript
interface ScreenOrientationWithLock extends ScreenOrientation {
  lock(orientation: 'landscape'): Promise<void>;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<GameState>('ready')
  const [lastScore, setLastScore] = useState<number>(0)
  const [bestScore, setBestScore] = useState<number>(0)
  const animationFrameRef = useRef<number>(0)
  const scrollOffsetRef = useRef<number>(0)
  const projectileRef = useRef<Projectile | null>(null)
  const backgroundElementsRef = useRef<BackgroundElement[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioInitialized, setAudioInitialized] = useState<boolean>(false)
  const wineMonkeyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [wineMonkeyQuote, setWineMonkeyQuote] = useState<string>('')
  const rubyMonkeyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [rubyMonkeyQuote, setRubyMonkeyQuote] = useState<string>('')
  const diamondMonkeyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [diamondMonkeyQuote, setDiamondMonkeyQuote] = useState<string>('')
  const goldenMonkeyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [goldenMonkeyQuote, setGoldenMonkeyQuote] = useState<string>('')
  const sapphireDuoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [sapphireDuoQuote, setSapphireDuoQuote] = useState<string>('')
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [language, setLanguage] = useState<Language>('en')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isPortrait, setIsPortrait] = useState<boolean>(false)
  const wineMonkeyAnimationRef = useRef<number>(0)
  const sapphireDuoAnimationRef = useRef<number>(0)
  const goldenMonkeyAnimationRef = useRef<number>(0)

  const poopARef = useRef<PoopState>({
    angle: 0,
    speed: 0.08, // Fixed speed
    baseRadius: 80, // Larger size
    amplitude: 40  // Larger amplitude
  })
  const poopBRef = useRef<PoopState>({
    angle: 0,
    speed: 0.06, // Fixed speed (slightly different for variation)
    baseRadius: 80, // Larger size
    amplitude: 40  // Larger amplitude
  })

      // Helper function to get translated text
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] as string
  }

  // Helper function to get translated arrays
  const tArray = (key: keyof typeof translations.en): string[] => {
    return translations[language][key] as string[]
  }

  // Check if device is mobile and orientation
  const checkDeviceAndOrientation = () => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
    const isPortraitMode = window.innerHeight > window.innerWidth

    setIsMobile(isMobileDevice)
    setIsPortrait(isPortraitMode)
  }

  useEffect(() => {
    // Load best score and language from localStorage on mount
    const savedBestScore = localStorage.getItem('poopGameBestScore')
    if (savedBestScore) {
      setBestScore(parseInt(savedBestScore, 10))
    }

    const savedLanguage = localStorage.getItem('poopGameLanguage') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ja')) {
      setLanguage(savedLanguage)
    }

    // Check device and orientation
    checkDeviceAndOrientation()

    // Initialize background elements
    initializeBackground()

    // Load mute state from localStorage
    const savedMuteState = localStorage.getItem('poopGameMuted')
    const initialMuteState = savedMuteState === 'true'
    setIsMuted(initialMuteState)

    // Initialize audio element
    const audio = new Audio('/bgm/sergio_magic.mp3')
    audio.loop = true
    audio.volume = initialMuteState ? 0 : 0.5
    audioRef.current = audio

    // Cleanup function to stop audio when component unmounts
    return () => {
      audio.pause()
      audio.currentTime = 0

      if (wineMonkeyTimeoutRef.current) {
        clearTimeout(wineMonkeyTimeoutRef.current)
      }
      if (rubyMonkeyTimeoutRef.current) {
        clearTimeout(rubyMonkeyTimeoutRef.current)
      }
      if (diamondMonkeyTimeoutRef.current) {
        clearTimeout(diamondMonkeyTimeoutRef.current)
      }
      if (goldenMonkeyTimeoutRef.current) {
        clearTimeout(goldenMonkeyTimeoutRef.current)
      }
    }
  }, [])

  // Effect to control audio playback based on isMuted state
  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause()
      } else {
        // Only play if audio has been initialized by user interaction
        if (audioInitialized) {
          audioRef.current.play().catch(console.error)
        }
      }
    }
  }, [isMuted, audioInitialized])

  const initializeBackground = () => {
    const elements: BackgroundElement[] = []

    // Add grass elements
    for (let i = 0; i < 50; i++) {
      elements.push({
        x: i * 100 + Math.random() * 50,
        y: window.innerHeight - 50 + Math.random() * 30,
        emoji: '🌿',
        type: 'grass'
      })
    }

    // Add clouds
    for (let i = 0; i < 20; i++) {
      elements.push({
        x: i * 200 + Math.random() * 100,
        y: 50 + Math.random() * 100,
        emoji: '☁️',
        type: 'cloud'
      })
    }

    // Add random animals
    const animals = ['🐇', '🐤', '🐮']
    for (let i = 0; i < 15; i++) {
      elements.push({
        x: i * 300 + Math.random() * 200,
        y: window.innerHeight - 80 + Math.random() * 20,
        emoji: animals[Math.floor(Math.random() * animals.length)],
        type: 'animal'
      })
    }

    backgroundElementsRef.current = elements
  }

  const triggerWineMonkeyScene = () => {
    const quotes = tArray('wineMonkeyLines')
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setWineMonkeyQuote(randomQuote)

    // Lower background music volume (only if not muted)
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = 0.2
    }

    setGameState('wine-monkey')
    wineMonkeyAnimationRef.current = 0 // Reset animation

    // Return to result after 5 seconds
    wineMonkeyTimeoutRef.current = setTimeout(() => {
      // Restore background music volume (only if not muted)
      if (audioRef.current && !isMuted) {
        audioRef.current.volume = 0.5
      }
      setGameState('result')
      setWineMonkeyQuote('')
    }, 5000)
  }

  const triggerRubyMonkeyScene = () => {
    const quotes = tArray('rubyMonkeyLines')
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setRubyMonkeyQuote(randomQuote)

    // Lower background music volume (only if not muted)
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = 0.2
    }

    setGameState('ruby-monkey')

    // Return to result after 5 seconds
    rubyMonkeyTimeoutRef.current = setTimeout(() => {
      // Restore background music volume (only if not muted)
      if (audioRef.current && !isMuted) {
        audioRef.current.volume = 0.5
      }
              setGameState('result')
        setRubyMonkeyQuote('')
      }, 5000)
  }

  const triggerGoldenMonkeyScene = () => {
    const quotes = tArray('goldenMonkeyLines')
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setGoldenMonkeyQuote(randomQuote)

    // Lower background music volume (only if not muted)
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = 0.2
    }

    setGameState('golden-monkey')
    goldenMonkeyAnimationRef.current = 0 // Reset animation

    // Return to result after 6 seconds
    goldenMonkeyTimeoutRef.current = setTimeout(() => {
      // Restore background music volume (only if not muted)
      if (audioRef.current && !isMuted) {
        audioRef.current.volume = 0.5
      }
      setGameState('result')
      setGoldenMonkeyQuote('')
    }, 6000)
  }

  const triggerDiamondMonkeyScene = () => {
    const quotes = tArray('diamondMonkeyLines')
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setDiamondMonkeyQuote(randomQuote)

    // Lower background music volume (only if not muted)
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = 0.2
    }

    setGameState('diamond-monkey')

    // Return to result after 6 seconds (longer for diamond scene)
    diamondMonkeyTimeoutRef.current = setTimeout(() => {
      // Restore background music volume (only if not muted)
      if (audioRef.current && !isMuted) {
        audioRef.current.volume = 0.5
      }
      setGameState('result')
      setDiamondMonkeyQuote('')
    }, 6000)
  }

  const triggerSapphireDuoScene = () => {
    const quotes = tArray('sapphireDuoLines')
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setSapphireDuoQuote(randomQuote)

    // Lower background music volume (only if not muted)
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = 0.2
    }

    setGameState('sapphire-duo')
    sapphireDuoAnimationRef.current = 0 // Reset animation

    // Return to result after 5 seconds
    sapphireDuoTimeoutRef.current = setTimeout(() => {
      // Restore background music volume (only if not muted)
      if (audioRef.current && !isMuted) {
        audioRef.current.volume = 0.5
      }
      setGameState('result')
      setSapphireDuoQuote('')
    }, 5000)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

                // Set canvas size to viewport
    const resizeCanvas = () => {
      // Get device pixel ratio for high DPI displays
      const dpr = window.devicePixelRatio || 1

      // Set canvas size to match viewport
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr

      // Scale the canvas back down using CSS
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'

      // Scale the drawing context so everything draws at the correct size
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      // Check device and orientation on resize
      checkDeviceAndOrientation()

      drawGame()
    }

        const animate = () => {
      if (gameState === 'playing') {
        // Update angles
        poopARef.current.angle += poopARef.current.speed
        poopBRef.current.angle += poopBRef.current.speed
      } else if (gameState === 'wine-monkey') {
        // Update wine monkey animation
        wineMonkeyAnimationRef.current += 0.02
      } else if (gameState === 'sapphire-duo') {
        // Update sapphire duo animation
        sapphireDuoAnimationRef.current += 0.02
      } else if (gameState === 'golden-monkey') {
        // Update golden monkey animation
        goldenMonkeyAnimationRef.current += 0.02
      } else if (gameState === 'flying' && projectileRef.current) {
        // Update projectile physics
        const projectile = projectileRef.current
        projectile.x += projectile.vx
        projectile.y += projectile.vy
        projectile.vy += projectile.gravity

        // Keep projectile within screen bounds (top boundary) - visual only, don't affect physics
        const canvas = canvasRef.current
        let displayY = projectile.y
        if (canvas && projectile.y < 50) {
          displayY = 50 // Display at least 50px from top, but keep real physics
        }

        // Store display position for rendering (but keep real physics for distance calculation)
        projectile.displayY = displayY

        // Update scroll offset to follow projectile
        if (canvas) {
          const targetScroll = Math.max(0, projectile.x - window.innerWidth / 3)
          scrollOffsetRef.current = targetScroll

                    // Check if projectile has landed
          if (projectile.y >= window.innerHeight - 100) {
            // Calculate final distance
            const distance = Math.round(projectile.x / 10) // Convert pixels to meters
            setLastScore(distance)

            // Update best score
            if (distance > bestScore) {
              setBestScore(distance)
              localStorage.setItem('poopGameBestScore', distance.toString())
            }

            // Check for special scenes
            if (distance >= 250 && distance <= 400) {
              triggerWineMonkeyScene()
            } else if (distance >= 700 && distance <= 749) {
              triggerSapphireDuoScene()
            } else if (distance >= 750 && distance <= 819) {
              triggerRubyMonkeyScene()
            } else if (distance >= 820 && distance <= 829) {
              triggerGoldenMonkeyScene()
            } else if (distance >= 830) {
              triggerDiamondMonkeyScene()
            } else {
              setGameState('result')
            }
            projectileRef.current = null
          }
        }
      }

      drawGame()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const drawGame = () => {
      // Use window dimensions for drawing (canvas is scaled for high DPI)
      const width = window.innerWidth
      const height = window.innerHeight

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw sky background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#87CEEB') // Sky blue
      gradient.addColorStop(0.7, '#FDF1D4') // Light beige
      gradient.addColorStop(1, '#90EE90') // Light green
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw background elements with scroll offset
      drawBackground(ctx, width, height)

      // Draw state-specific content
      if (gameState === 'ready') {
        drawReadyState(ctx, width, height)
      } else if (gameState === 'playing') {
        drawPlayingState(ctx, width, height)
      } else if (gameState === 'flying') {
        drawFlyingState(ctx, width, height)
      } else if (gameState === 'wine-monkey') {
        drawWineMonkeyState(ctx, width, height)
      } else if (gameState === 'sapphire-duo') {
        drawSapphireDuoState(ctx, width, height)
      } else if (gameState === 'ruby-monkey') {
        drawRubyMonkeyState(ctx, width, height)
      } else if (gameState === 'golden-monkey') {
        drawGoldenMonkeyState(ctx, width, height)
      } else if (gameState === 'diamond-monkey') {
        drawDiamondMonkeyState(ctx, width, height)
      } else if (gameState === 'result') {
        drawResultState(ctx, width, height)
      }
    }

    const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.font = '24px Arial'
      backgroundElementsRef.current.forEach(element => {
        // Apply scroll offset only during flying state
        const x = gameState === 'flying' ? element.x - scrollOffsetRef.current : element.x
        // Only draw elements that are visible on screen
        if (x > -50 && x < width + 50) {
          ctx.fillText(element.emoji, x, element.y)
        }
      })
    }

        const         drawReadyState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw artistic title
      ctx.fillStyle = '#8B4513'
      ctx.font = 'bold 36px serif'
      ctx.textAlign = 'center'
      ctx.fillText(t('title'), width / 2, height / 2 - 60)

      ctx.fillStyle = '#666'
      ctx.font = 'italic 20px serif'
      ctx.fillText(t('subtitle'), width / 2, height / 2 - 20)

      ctx.fillStyle = '#333'
      ctx.font = '16px Arial'
      ctx.fillText(t('start'), width / 2, height / 2 + 30)

      // Draw language toggle icon on home screen
      ctx.fillStyle = '#8B4513'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🌐', width / 2 - 100, height / 2 + 80)
      ctx.fillStyle = '#666'
      ctx.font = '12px Arial'
      ctx.fillText(language === 'en' ? '日本語' : 'EN', width / 2 - 100, height / 2 + 100)

      // Draw audio toggle icon on home screen with clear ON/OFF indication
      ctx.fillStyle = isMuted ? '#DC2626' : '#16A34A' // Red for OFF, Green for ON
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(isMuted ? '🔇' : '🔊', width / 2 + 100, height / 2 + 80)
      ctx.fillStyle = isMuted ? '#DC2626' : '#16A34A'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(isMuted ? (language === 'en' ? 'OFF' : 'オフ') : (language === 'en' ? 'ON' : 'オン'), width / 2 + 100, height / 2 + 100)
    }

        const createRainbowGradient = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, '#ff0000') // Red
      gradient.addColorStop(0.16, '#ff8000') // Orange
      gradient.addColorStop(0.33, '#ffff00') // Yellow
      gradient.addColorStop(0.5, '#00ff00') // Green
      gradient.addColorStop(0.66, '#0080ff') // Blue
      gradient.addColorStop(0.83, '#8000ff') // Indigo
      gradient.addColorStop(1, '#ff00ff') // Violet
      return gradient
    }

    const drawPlayingState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Calculate animated radii
      const poopA = poopARef.current
      const poopB = poopBRef.current
      const radiusA = poopA.baseRadius + poopA.amplitude * Math.sin(poopA.angle)
      const radiusB = poopB.baseRadius + poopB.amplitude * Math.sin(poopB.angle)

      const centerAX = width / 2 - 75;
      const centerAY = height / 2;
      const centerBX = width / 2 + 75;
      const centerBY = height / 2;

      // Calculate overlap area
      const overlapArea = calculateCircleOverlapArea(centerAX, centerAY, radiusA, centerBX, centerBY, radiusB)

      // Draw poopA (left circle - outline only)
      ctx.strokeStyle = '#8B4513'
      ctx.lineWidth = 6
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(centerAX, centerAY, radiusA, 0, Math.PI * 2)
      ctx.stroke()

      // Draw poopB (right circle - outline only)
      ctx.strokeStyle = '#654321'
      ctx.lineWidth = 6
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(centerBX, centerBY, radiusB, 0, Math.PI * 2)
      ctx.stroke()

      // Reset shadow for text
      ctx.shadowBlur = 0

      // Draw playing text
      ctx.fillStyle = '#333'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
              ctx.fillText(t('playing'), width / 2, height / 4)

            ctx.fillStyle = '#333'
      ctx.font = '16px Arial'
              ctx.fillText(t('launch'), width / 2, height * 3 / 4)
    }

            const drawFlyingState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw projectile if it exists
      if (projectileRef.current) {
        const projectile = projectileRef.current
        const x = projectile.x - scrollOffsetRef.current
        const y = projectile.displayY !== undefined ? projectile.displayY : projectile.y // Use display position if available

        // Normal poop
        ctx.font = '32px Arial'
        ctx.textAlign = 'center'
        ctx.shadowBlur = 0
        ctx.fillText('💩', x, y)

        // Normal trail
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)'
        ctx.lineWidth = 3
        ctx.shadowBlur = 0

        // Draw trajectory trail
        ctx.beginPath()
        ctx.moveTo(x - projectile.vx * 5, y - projectile.vy * 5)
        ctx.lineTo(x, y)
        ctx.stroke()

        // Reset shadow
        ctx.shadowBlur = 0
      }

      // Draw distance indicator
      ctx.fillStyle = '#333'
      ctx.font = '18px Arial'
      ctx.textAlign = 'left'
      const currentDistance = projectileRef.current ? Math.round(projectileRef.current.x / 10) : 0
      ctx.fillText(`${t('distance')}: ${currentDistance}m`, 10, 30)
    }

        const drawWineMonkeyState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw elegant background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#2C1810')
      gradient.addColorStop(1, '#8B4513')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Animation progress (0 to 1 over 5 seconds)
      const animTime = wineMonkeyAnimationRef.current
      const slideProgress = Math.min(animTime * 2, 1) // Slide in over first 0.5 seconds
      const slideOutProgress = Math.max(0, (animTime - 4.5) * 2) // Slide out in last 0.5 seconds

      // Calculate monkey position (slide in from left, slide out to left)
      let monkeyX = width / 2 - 100
      if (slideProgress < 1) {
        monkeyX = -200 + (width / 2 + 100) * slideProgress
      } else if (slideOutProgress > 0) {
        monkeyX = (width / 2 - 100) - (width / 2 + 100) * slideOutProgress
      }

      // Add subtle head tilt animation
      const headTilt = Math.sin(animTime * 3) * 0.1

      ctx.save()
      ctx.translate(monkeyX + 60, height / 2 - 60)
      ctx.rotate(headTilt)

      // Draw classy monkey character with animation
      ctx.font = '120px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🐒', 0, 60)
      ctx.restore()

      // Draw wine bottle and glass (only when monkey is in position)
      if (slideProgress >= 1 && slideOutProgress === 0) {
        ctx.font = '60px Arial'
        ctx.textAlign = 'center'

        // Animate pouring motion
        const pourAnimation = Math.sin(animTime * 2) * 0.5 + 0.5
        ctx.fillText('🍷', width / 2, height / 2 + pourAnimation * 10)
        ctx.fillText('🍾', width / 2 + 80, height / 2 - 20 - pourAnimation * 5)
      }

      // Draw speech bubble background
      const bubbleX = width / 2
      const bubbleY = height / 2 - 120
      const bubbleWidth = Math.min(width - 40, 600)
      const bubbleHeight = 80

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.strokeStyle = '#8B4513'
      ctx.lineWidth = 3

      // Rounded rectangle for speech bubble
      ctx.beginPath()
      ctx.roundRect(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 20)
      ctx.fill()
      ctx.stroke()

      // Draw speech bubble tail
      ctx.beginPath()
      ctx.moveTo(bubbleX - 20, bubbleY + bubbleHeight/2)
      ctx.lineTo(bubbleX, bubbleY + bubbleHeight/2 + 20)
      ctx.lineTo(bubbleX + 20, bubbleY + bubbleHeight/2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw the quote
      ctx.fillStyle = '#2C1810'
      ctx.font = 'italic 18px serif'
      ctx.textAlign = 'center'

      // Word wrap the quote
      const words = wineMonkeyQuote.split(' ')
      const maxWidth = bubbleWidth - 40
      let line = ''
      let y = bubbleY - 10

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, bubbleX, y)
          line = words[n] + ' '
          y += 25
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, bubbleX, y)

      // Draw title
      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 24px serif'
      ctx.fillText(t('wineMonkeyTitle'), width / 2, height / 2 + 100)
    }

    const drawSapphireDuoState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw elegant sapphire background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#0F1B3C')
      gradient.addColorStop(0.5, '#1E3A8A')
      gradient.addColorStop(1, '#3B82F6')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Animation progress
      const animTime = sapphireDuoAnimationRef.current
      const slideProgressMonkey = Math.min(animTime * 2, 1) // Monkey slides in from left
      const slideProgressCow = Math.min((animTime - 0.5) * 2, 1) // Cow slides in from right (delayed)
      const slideOutProgress = Math.max(0, (animTime - 4) * 2) // Both slide out

      // Calculate monkey position (left side)
      let monkeyX = width / 4
      if (slideProgressMonkey < 1) {
        monkeyX = -150 + (width / 4 + 150) * slideProgressMonkey
      } else if (slideOutProgress > 0) {
        monkeyX = (width / 4) - (width / 4 + 150) * slideOutProgress
      }

      // Calculate cow position (right side)
      let cowX = (width * 3) / 4
      if (slideProgressCow < 1) {
        cowX = width + 150 - (width / 4 + 150) * slideProgressCow
      } else if (slideOutProgress > 0) {
        cowX = ((width * 3) / 4) + (width / 4 + 150) * slideOutProgress
      }

      // Add subtle head movements
      const monkeyBob = Math.sin(animTime * 2) * 0.05
      const cowBob = Math.sin(animTime * 2.5) * 0.05

      // Draw monkey (left side)
      if (slideProgressMonkey > 0) {
        ctx.save()
        ctx.translate(monkeyX, height / 2 + monkeyBob * 20)
        ctx.font = '120px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('🐒', 0, 0)
        ctx.restore()
      }

      // Draw cow (right side)
      if (slideProgressCow > 0) {
        ctx.save()
        ctx.translate(cowX, height / 2 + cowBob * 20)
        ctx.font = '120px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('🐄', 0, 0)
        ctx.restore()
      }

      // Draw sapphire in center (when both are present)
      if (slideProgressMonkey >= 1 && slideProgressCow >= 1 && slideOutProgress === 0) {
        const sapphirePulse = Math.sin(animTime * 4) * 0.1 + 1
        ctx.save()
        ctx.translate(width / 2, height / 2 - 50)
        ctx.scale(sapphirePulse, sapphirePulse)
        ctx.font = '80px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('💎', 0, 0)
        ctx.restore()

        // Add sparkles around sapphire
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8 + animTime
          const x = width / 2 + Math.cos(angle) * 60
          const y = height / 2 - 50 + Math.sin(angle) * 60
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw speech bubble
      const bubbleX = width / 2
      const bubbleY = height / 2 - 140
      const bubbleWidth = Math.min(width - 40, 600)
      const bubbleHeight = 80

      ctx.fillStyle = 'rgba(219, 234, 254, 0.95)'
      ctx.strokeStyle = '#1E3A8A'
      ctx.lineWidth = 3

      ctx.beginPath()
      ctx.roundRect(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 20)
      ctx.fill()
      ctx.stroke()

      // Draw speech bubble tail
      ctx.beginPath()
      ctx.moveTo(bubbleX - 20, bubbleY + bubbleHeight/2)
      ctx.lineTo(bubbleX, bubbleY + bubbleHeight/2 + 20)
      ctx.lineTo(bubbleX + 20, bubbleY + bubbleHeight/2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw the quote
      ctx.fillStyle = '#1E3A8A'
      ctx.font = 'italic 18px serif'
      ctx.textAlign = 'center'

      const words = sapphireDuoQuote.split(' ')
      const maxWidth = bubbleWidth - 40
      let line = ''
      let y = bubbleY - 10

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, bubbleX, y)
          line = words[n] + ' '
          y += 25
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, bubbleX, y)

      // Draw title
      ctx.fillStyle = '#3B82F6'
      ctx.font = 'bold 26px serif'
      ctx.fillText(t('sapphireDuoTitle'), width / 2, height / 2 + 120)
    }

    const drawRubyMonkeyState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw elegant ruby background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, '#4A0E0E')
      gradient.addColorStop(0.5, '#8B0000')
      gradient.addColorStop(1, '#DC143C')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Add sparkle effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 3 + 1
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw majestic monkey character
      ctx.font = '140px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🐒', width / 2 - 120, height / 2 + 20)

      // Draw ruby gem
      ctx.font = '80px Arial'
      ctx.fillText('💎', width / 2 + 60, height / 2 - 30)

      // Draw crown for majesty
      ctx.font = '60px Arial'
      ctx.fillText('👑', width / 2 - 120, height / 2 - 80)

      // Draw speech bubble background
      const bubbleX = width / 2
      const bubbleY = height / 2 - 140
      const bubbleWidth = Math.min(width - 40, 650)
      const bubbleHeight = 90

      ctx.fillStyle = 'rgba(255, 215, 0, 0.95)'
      ctx.strokeStyle = '#8B0000'
      ctx.lineWidth = 4

      // Rounded rectangle for speech bubble
      ctx.beginPath()
      ctx.roundRect(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 25)
      ctx.fill()
      ctx.stroke()

      // Draw speech bubble tail
      ctx.beginPath()
      ctx.moveTo(bubbleX - 30, bubbleY + bubbleHeight/2)
      ctx.lineTo(bubbleX, bubbleY + bubbleHeight/2 + 25)
      ctx.lineTo(bubbleX + 30, bubbleY + bubbleHeight/2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw the quote
      ctx.fillStyle = '#8B0000'
      ctx.font = 'bold 20px serif'
      ctx.textAlign = 'center'

      // Word wrap the quote
      const words = rubyMonkeyQuote.split(' ')
      const maxWidth = bubbleWidth - 50
      let line = ''
      let y = bubbleY - 15

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, bubbleX, y)
          line = words[n] + ' '
          y += 28
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, bubbleX, y)

      // Draw title
      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 28px serif'
      ctx.fillText(t('rubyMonkeyTitle'), width / 2, height / 2 + 120)
    }

    const drawGoldenMonkeyState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw magnificent golden background
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height))
      gradient.addColorStop(0, '#FFF8DC')
      gradient.addColorStop(0.3, '#FFD700')
      gradient.addColorStop(0.6, '#DAA520')
      gradient.addColorStop(1, '#B8860B')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Animation progress
      const animTime = goldenMonkeyAnimationRef.current
      const slideProgress = Math.min(animTime * 2, 1) // Slide in over first 0.5 seconds
      const slideOutProgress = Math.max(0, (animTime - 5.5) * 2) // Slide out in last 0.5 seconds

      // Add golden sparkle effect
      ctx.fillStyle = 'rgba(255, 215, 0, 0.8)'
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 4 + 1
        const opacity = Math.random() * 0.6 + 0.4
        ctx.globalAlpha = opacity
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Add golden rays
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)'
      ctx.lineWidth = 3
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8 + animTime
        const startX = width / 2 + Math.cos(angle) * 80
        const startY = height / 2 + Math.sin(angle) * 80
        const endX = width / 2 + Math.cos(angle) * 250
        const endY = height / 2 + Math.sin(angle) * 250

        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }

      // Calculate monkey position (slide in from right, slide out to right)
      let monkeyX = width / 2 - 100
      if (slideProgress < 1) {
        monkeyX = width + 200 - (width / 2 + 300) * slideProgress
      } else if (slideOutProgress > 0) {
        monkeyX = (width / 2 - 100) + (width / 2 + 300) * slideOutProgress
      }

      // Add majestic floating animation
      const floatOffset = Math.sin(animTime * 3) * 15

      // Draw supreme golden monkey character
      ctx.save()
      ctx.translate(monkeyX, height / 2 + floatOffset)
      ctx.font = '140px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🐒', 0, 0)
      ctx.restore()

      // Draw golden elements around the monkey (only when in position)
      if (slideProgress >= 1 && slideOutProgress === 0) {
        // Golden crown
        ctx.font = '70px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('👑', monkeyX, height / 2 - 80 + floatOffset)

        // Golden stars
        ctx.font = '50px Arial'
        const starPulse = Math.sin(animTime * 4) * 0.2 + 1
        ctx.save()
        ctx.translate(monkeyX - 120, height / 2 - 30 + floatOffset)
        ctx.scale(starPulse, starPulse)
        ctx.fillText('⭐', 0, 0)
        ctx.restore()

        ctx.save()
        ctx.translate(monkeyX + 120, height / 2 - 30 + floatOffset)
        ctx.scale(starPulse, starPulse)
        ctx.fillText('⭐', 0, 0)
        ctx.restore()

        // Golden trophy
        ctx.font = '60px Arial'
        ctx.fillText('🏆', monkeyX + 80, height / 2 + 60 + floatOffset)
      }

      // Draw speech bubble background (golden theme)
      const bubbleX = width / 2
      const bubbleY = height / 2 - 140
      const bubbleWidth = Math.min(width - 40, 700)
      const bubbleHeight = 90

      // Golden gradient bubble background
      const bubbleGradient = ctx.createLinearGradient(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleX + bubbleWidth/2, bubbleY + bubbleHeight/2)
      bubbleGradient.addColorStop(0, 'rgba(255, 215, 0, 0.95)')
      bubbleGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)')
      bubbleGradient.addColorStop(1, 'rgba(255, 215, 0, 0.95)')
      ctx.fillStyle = bubbleGradient

      ctx.strokeStyle = '#B8860B'
      ctx.lineWidth = 4

      // Rounded rectangle for speech bubble
      ctx.beginPath()
      ctx.roundRect(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 25)
      ctx.fill()
      ctx.stroke()

      // Draw speech bubble tail
      ctx.beginPath()
      ctx.moveTo(bubbleX - 30, bubbleY + bubbleHeight/2)
      ctx.lineTo(bubbleX, bubbleY + bubbleHeight/2 + 25)
      ctx.lineTo(bubbleX + 30, bubbleY + bubbleHeight/2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw the quote with golden styling
      ctx.fillStyle = '#B8860B'
      ctx.font = 'bold 20px serif'
      ctx.textAlign = 'center'

      // Word wrap the quote
      const words = goldenMonkeyQuote.split(' ')
      const maxWidth = bubbleWidth - 50
      let line = ''
      let y = bubbleY - 15

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, bubbleX, y)
          line = words[n] + ' '
          y += 28
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, bubbleX, y)

      // Draw title with golden glow effect
      ctx.shadowColor = 'rgba(255, 215, 0, 0.8)'
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 30px serif'
      ctx.fillText(t('goldenMonkeyTitle'), width / 2, height / 2 + 130)

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

    const drawDiamondMonkeyState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Draw magnificent diamond background
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height))
      gradient.addColorStop(0, '#E6E6FA')
      gradient.addColorStop(0.3, '#9370DB')
      gradient.addColorStop(0.6, '#4B0082')
      gradient.addColorStop(1, '#191970')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Add intense sparkle effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 5 + 2
        const opacity = Math.random() * 0.8 + 0.2
        ctx.globalAlpha = opacity
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Add diamond rays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 2
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12
        const startX = width / 2 + Math.cos(angle) * 100
        const startY = height / 2 + Math.sin(angle) * 100
        const endX = width / 2 + Math.cos(angle) * 300
        const endY = height / 2 + Math.sin(angle) * 300

        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }

      // Draw supreme monkey character
      ctx.font = '160px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🐒', width / 2 - 140, height / 2 + 30)

      // Draw multiple diamonds for ultimate luxury
      ctx.font = '100px Arial'
      ctx.fillText('💎', width / 2 + 80, height / 2 - 40)
      ctx.font = '60px Arial'
      ctx.fillText('💎', width / 2 + 140, height / 2 + 20)
      ctx.fillText('💎', width / 2 + 40, height / 2 + 60)

      // Draw imperial crown
      ctx.font = '80px Arial'
      ctx.fillText('👑', width / 2 - 140, height / 2 - 100)

      // Draw royal scepter
      ctx.font = '50px Arial'
      ctx.fillText('🔱', width / 2 - 200, height / 2)

      // Draw speech bubble background (larger and more luxurious)
      const bubbleX = width / 2
      const bubbleY = height / 2 - 160
      const bubbleWidth = Math.min(width - 30, 750)
      const bubbleHeight = 100

      // Gradient bubble background
      const bubbleGradient = ctx.createLinearGradient(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleX + bubbleWidth/2, bubbleY + bubbleHeight/2)
      bubbleGradient.addColorStop(0, 'rgba(255, 215, 0, 0.98)')
      bubbleGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.98)')
      bubbleGradient.addColorStop(1, 'rgba(255, 215, 0, 0.98)')
      ctx.fillStyle = bubbleGradient

      ctx.strokeStyle = '#4B0082'
      ctx.lineWidth = 5

      // Rounded rectangle for speech bubble
      ctx.beginPath()
      ctx.roundRect(bubbleX - bubbleWidth/2, bubbleY - bubbleHeight/2, bubbleWidth, bubbleHeight, 30)
      ctx.fill()
      ctx.stroke()

      // Draw speech bubble tail
      ctx.beginPath()
      ctx.moveTo(bubbleX - 40, bubbleY + bubbleHeight/2)
      ctx.lineTo(bubbleX, bubbleY + bubbleHeight/2 + 30)
      ctx.lineTo(bubbleX + 40, bubbleY + bubbleHeight/2)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Draw the quote with elegant styling
      ctx.fillStyle = '#4B0082'
      ctx.font = 'bold 22px serif'
      ctx.textAlign = 'center'

      // Word wrap the quote
      const words = diamondMonkeyQuote.split(' ')
      const maxWidth = bubbleWidth - 60
      let line = ''
      let y = bubbleY - 20

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, bubbleX, y)
          line = words[n] + ' '
          y += 30
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, bubbleX, y)

      // Draw title with shadow effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3

      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 32px serif'
      ctx.fillText(t('diamondMonkeyTitle'), width / 2, height / 2 + 140)

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }

            const getScoreMessage = (score: number) => {
      if (score >= 1000) return { text: '🏆 PERFECT! 🏆', color: '#FF1493' }
      if (score >= 950) return { text: '💎 LEGENDARY! 💎', color: '#9932CC' }
      if (score >= 830) return { text: '💎 DIAMOND! 💎', color: '#9932CC' }
      if (score >= 820) return { text: '🌟 GOLDEN! 🌟', color: '#FFD700' }
      if (score >= 800) return { text: '🔥 EXCELLENT! 🔥', color: '#FF6347' }
      if (score >= 700) return { text: '🌟 GREAT! 🌟', color: '#FFD700' }
      if (score >= 600) return { text: '👍 GOOD! 👍', color: '#32CD32' }
      return { text: t('results'), color: '#333' }
    }

    const drawResultState = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const scoreMessage = getScoreMessage(lastScore)

      // Draw result text with score-based message
      ctx.fillStyle = scoreMessage.color
      ctx.font = 'bold 28px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(scoreMessage.text, width / 2, height / 2 - 80)

      ctx.fillStyle = '#333'
      ctx.font = '20px Arial'
                      ctx.fillText(`${t('yourScore')}: ${lastScore}m`, width / 2, height / 2 - 30)
        ctx.fillText(`${t('bestScore')}: ${bestScore}m`, width / 2, height / 2 + 10)

      // Add achievement messages
      if (lastScore >= 1000) {
        ctx.fillStyle = '#FF1493'
        ctx.font = '16px Arial'
        ctx.fillText(translations[language].achievements.legendary, width / 2, height / 2 + 40)
      } else if (lastScore >= 950) {
        ctx.fillStyle = '#9932CC'
        ctx.font = '16px Arial'
        ctx.fillText(translations[language].achievements.legendary, width / 2, height / 2 + 40)
      } else if (lastScore >= 830) {
        ctx.fillStyle = '#9932CC'
        ctx.font = '16px Arial'
        ctx.fillText(translations[language].achievements.legendary, width / 2, height / 2 + 40)
      } else if (lastScore >= 820) {
        ctx.fillStyle = '#FFD700'
        ctx.font = '16px Arial'
        ctx.fillText(translations[language].achievements.amazing, width / 2, height / 2 + 40)
      } else if (lastScore >= 800) {
        ctx.fillStyle = '#FF6347'
        ctx.font = '16px Arial'
        ctx.fillText(translations[language].achievements.excellent, width / 2, height / 2 + 40)
      } else if (lastScore >= 700) {
        ctx.fillStyle = '#FFD700'
        ctx.font = '16px Arial'
        ctx.fillText(translations[language].achievements.great, width / 2, height / 2 + 40)
      } else if (lastScore >= 600) {
        ctx.fillStyle = '#32CD32'
        ctx.font = '16px Arial'
        ctx.fillText(translations[language].achievements.good, width / 2, height / 2 + 40)
      }

      ctx.fillStyle = '#333'
      ctx.font = '16px Arial'
      ctx.fillText(t('restart'), width / 2, height / 2 + 70)
    }

        const calculateCircleOverlapArea = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

      // No overlap
      if (d >= r1 + r2) return 0

      // One circle completely inside the other
      if (d <= Math.abs(r1 - r2)) {
        const smallerRadius = Math.min(r1, r2)
        return Math.PI * smallerRadius * smallerRadius
      }

      // Partial overlap - calculate intersection area
      const a = r1 * r1
      const b = r2 * r2
      const x = (a - b + d * d) / (2 * d)
      const z = x - d
      const y = Math.sqrt(a - x * x)

      const area = a * Math.acos(x / r1) + b * Math.acos(-z / r2) - y * d
      return area
    }

                const launchProjectile = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      // Get current radii
      const poopA = poopARef.current
      const poopB = poopBRef.current
      const rA = poopA.baseRadius + poopA.amplitude * Math.sin(poopA.angle)
      const rB = poopB.baseRadius + poopB.amplitude * Math.sin(poopB.angle)

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Calculate circle positions (updated positions)
      const centerAX = width / 2 - 75;
      const centerAY = height / 2;
      const centerBX = width / 2 + 75;
      const centerBY = height / 2;

      // Calculate overlap area
      const overlapArea = calculateCircleOverlapArea(centerAX, centerAY, rA, centerBX, centerBY, rB)

                              // Base launch power on actual overlap area with balanced difficulty scaling
      // Scale the area for achievable 750m, then progressively harder
      const areaPower = Math.sqrt(overlapArea) / 90 // Slightly easier base scaling
      let launchPower = Math.max(0.3, Math.min(2.1, areaPower)) // Good range for progression

      // 750m+ achievable with effort (10-20 tries)
      if (areaPower > 1.3) { // 750m threshold - achievable
        const excess = areaPower - 1.3
        launchPower = 1.3 + excess * 0.28 // Good growth after 750m
      }

      // 850m+ challenging (40-50 tries)
      if (areaPower > 1.65) { // 850m threshold
        const excess = areaPower - 1.65
        launchPower = 1.65 + excess * 0.15 // Steeper curve after 850m
      }

      // 950m+ very difficult (100+ tries)
      if (areaPower > 1.9) { // 950m threshold
        const excess = areaPower - 1.9
        launchPower = 1.9 + excess * 0.08 // Much steeper after 950m
      }

      // 1000m extremely difficult - requires near-perfect overlap (300+ tries)
      if (areaPower > 2.05) { // 1000m threshold
        const excess = areaPower - 2.05
        launchPower = 2.05 + excess * 0.02 // Very slow growth - very challenging
      }

              projectileRef.current = {
          x: width / 2, // Between the two circles
          y: height / 2,
          vx: launchPower * 18 + 14, // Balanced horizontal velocity
          vy: launchPower * -11 - 6, // Balanced vertical velocity
          gravity: 0.19, // Slightly higher gravity for moderate difficulty
          isRainbow: false // No more rainbow mode
        } as any

      setGameState('flying')
    }

    const resetPoopSpeeds = () => {
      poopARef.current.speed = 0.08 // Fixed speed
      poopBRef.current.speed = 0.06 // Fixed speed (slightly different for variation)
      poopARef.current.angle = 0
      poopBRef.current.angle = 0
    }

    const handleStartGame = async () => {
    // On mobile, if in portrait mode, do not start the game.
    // Instead, attempt to lock orientation and wait for the user to try again.
    if (isMobile && isPortrait) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(console.error);
        }
        const orientation = screen.orientation as ScreenOrientationWithLock;
        if (orientation && orientation.lock) {
          await orientation.lock('landscape').catch(console.error);
        }
      } catch (err) {
        console.error(`Could not lock orientation: ${err}`);
      }
      // IMPORTANT: Do not start the game yet. User needs to be in landscape.
      return;
    }

    // If orientation is correct, proceed to start the game.
    initializeAudio();
    resetPoopSpeeds();
    scrollOffsetRef.current = 0;
    setGameState('playing');
  }

    const handleCanvasClick = (event: MouseEvent | TouchEvent) => {
      // Audio is now initialized in handleStartGame to ensure it's a direct user action

      if (gameState === 'ready') {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
        const x = clientX - rect.left
        const y = clientY - rect.top

        // Check if clicked on language toggle area (use window dimensions, not canvas dimensions)
        const langIconX = window.innerWidth / 2 - 100
        const langIconY = window.innerHeight / 2 + 80
        if (Math.abs(x - langIconX) < 40 && Math.abs(y - langIconY) < 40) {
          toggleLanguage()
          return
        }

        // Check if clicked on audio toggle area (use window dimensions, not canvas dimensions)
        const audioIconX = window.innerWidth / 2 + 100
        const audioIconY = window.innerHeight / 2 + 80
        if (Math.abs(x - audioIconX) < 40 && Math.abs(y - audioIconY) < 40) {
          toggleMute()
          return
        }

        // Otherwise start the game
        handleStartGame()
      } else if (gameState === 'playing') {
        launchProjectile()
      } else if (gameState === 'wine-monkey') {
        // Skip wine monkey scene on click
        if (wineMonkeyTimeoutRef.current) {
          clearTimeout(wineMonkeyTimeoutRef.current)
        }
        if (audioRef.current && !isMuted) {
          audioRef.current.volume = 0.5
        }
        setGameState('result')
        setWineMonkeyQuote('')
      } else if (gameState === 'sapphire-duo') {
        // Skip sapphire duo scene on click
        if (sapphireDuoTimeoutRef.current) {
          clearTimeout(sapphireDuoTimeoutRef.current)
        }
        if (audioRef.current && !isMuted) {
          audioRef.current.volume = 0.5
        }
        setGameState('result')
        setSapphireDuoQuote('')
      } else if (gameState === 'ruby-monkey') {
        // Skip ruby monkey scene on click
        if (rubyMonkeyTimeoutRef.current) {
          clearTimeout(rubyMonkeyTimeoutRef.current)
        }
        if (audioRef.current && !isMuted) {
          audioRef.current.volume = 0.5
        }
        setGameState('result')
        setRubyMonkeyQuote('')
      } else if (gameState === 'golden-monkey') {
        // Skip golden monkey scene on click
        if (goldenMonkeyTimeoutRef.current) {
          clearTimeout(goldenMonkeyTimeoutRef.current)
        }
        if (audioRef.current && !isMuted) {
          audioRef.current.volume = 0.5
        }
        setGameState('result')
        setGoldenMonkeyQuote('')
        goldenMonkeyAnimationRef.current = 0
      } else if (gameState === 'diamond-monkey') {
        // Skip diamond monkey scene on click
        if (diamondMonkeyTimeoutRef.current) {
          clearTimeout(diamondMonkeyTimeoutRef.current)
        }
        if (audioRef.current && !isMuted) {
          audioRef.current.volume = 0.5
        }
        setGameState('result')
        setDiamondMonkeyQuote('')
      } else if (gameState === 'result') {
        // Return to ready state on click
        handleReset()
      }
      // Note: flying state doesn't respond to canvas clicks
    }

    // Initial setup
    resizeCanvas()
    animate() // Start animation loop
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('orientationchange', () => {
      // Delay to ensure orientation change is complete
      setTimeout(() => {
        resizeCanvas()
      }, 100)
    })
    canvas.addEventListener('click', handleCanvasClick as EventListener)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('orientationchange', resizeCanvas)
      canvas.removeEventListener('click', handleCanvasClick as EventListener)
    }
  }, [gameState, language, isMuted, isMobile, isPortrait])

  const handleReset = () => {
    // Audio will be re-initialized on next game start if needed.
    // Keep BGM playing continuously - no restart needed

    // Reset scroll offset to prevent screen shifting
    scrollOffsetRef.current = 0
    projectileRef.current = null
    setGameState('ready')
  }

  const initializeAudio = () => {
    if (!audioInitialized && audioRef.current) {
      if (!isMuted) {
        audioRef.current.play().catch(console.error)
      }
      setAudioInitialized(true)
    }
  }

    const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    localStorage.setItem('poopGameMuted', newMutedState.toString())
  }

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'en' ? 'ja' : 'en'
    setLanguage(newLanguage)
    localStorage.setItem('poopGameLanguage', newLanguage)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        className="absolute top-0 left-0 w-full h-full"
        style={{
          cursor: gameState === 'flying' ? 'default' : 'pointer',
          touchAction: 'manipulation',
          pointerEvents: gameState === 'flying' ? 'none' : 'auto',
          imageRendering: 'auto' // Standard canvas rendering
        }}
      />

      {/* Mobile Portrait Overlay */}
      {isMobile && isPortrait && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center p-8 bg-white bg-opacity-90 rounded-lg mx-4 max-w-sm">
            <div className="text-6xl mb-4">📱</div>
            <div className="text-xl font-bold text-gray-800 mb-2">
              {t('forceRotatePhone')}
            </div>
            <div className="text-4xl animate-bounce">
              🔄
            </div>
          </div>
        </div>
      )}

      {/* Language Toggle Button */}
      <button
        onClick={toggleLanguage}
        className="fixed top-5 left-5 px-4 py-2 rounded-lg border-none bg-amber-800 bg-opacity-90 text-white text-sm font-bold cursor-pointer z-50 flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-amber-900 hover:scale-105 active:scale-95"
        style={{
          touchAction: 'manipulation'
        }}
      >
        {language === 'en' ? '日本語' : 'EN'}
      </button>

      {/* Mute Toggle Button */}
      <button
        onClick={toggleMute}
        className={`fixed top-5 right-5 w-16 h-16 rounded-full border-2 text-2xl cursor-pointer z-50 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
          isMuted
            ? 'bg-red-600 border-red-700 text-white hover:bg-red-700'
            : 'bg-green-600 border-green-700 text-white hover:bg-green-700'
        }`}
        style={{
          touchAction: 'manipulation'
        }}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
      {gameState === 'result' && (
        <div
          id="resultBox"
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-50 border-4 border-amber-800 rounded-xl p-6 shadow-2xl text-center z-40 max-w-sm mx-4"
        >
          <div className="text-xl mb-4 text-gray-800 font-semibold">
            💩{t('distance')}: {lastScore}m | BEST: {bestScore}m
          </div>
          <button
            onClick={handleReset}
            className="bg-amber-800 text-white border-none rounded-lg px-6 py-3 text-base cursor-pointer font-bold shadow-md transition-all duration-200 hover:bg-amber-900 hover:-translate-y-0.5 active:translate-y-0 mb-2"
          >
            {t('tryAgain')}
          </button>
          <div className="text-sm text-gray-600 mt-2">
            {language === 'en' ? 'Or tap anywhere to restart' : 'または画面をタップして再開'}
          </div>
        </div>
      )}
    </div>
  )
}
