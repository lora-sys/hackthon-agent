import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPRITES_DIR = join(__dirname, '../public/sprites')

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function createPNG(width, height, drawFn) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  drawFn(ctx, width, height)
  return canvas.toBuffer('image/png')
}

const styles = {
  dungeon: {
    bg: '#0f0f1a',
    floor: '#3a3632',
    floorAlt: '#35312d',
    wall: '#4a4650',
    wallDark: '#3a3640',
    player: '#64b4ff',
    enemy1: '#64c864',
    enemy2: '#e6dcc8',
    enemy3: '#504064',
    boss1: '#b43232',
    boss2: '#9650b4',
    coin: '#ffc832',
    potion1: '#dc3232',
    potion2: '#3264dc',
    key: '#c8b432',
    chest: '#8b5a2b',
    chestAccent: '#a0522d',
    gold: '#ffd700',
  },
  space: {
    bg: '#050510',
    floor: '#1a1a2e',
    floorAlt: '#16213e',
    wall: '#0f3460',
    wallDark: '#0a1a30',
    player: '#00d4ff',
    enemy1: '#7b2cbf',
    enemy2: '#3a0ca3',
    enemy3: '#4cc9f0',
    boss1: '#f72585',
    boss2: '#7209b7',
    coin: '#ffd60a',
    potion1: '#06d6a0',
    potion2: '#118ab2',
    key: '#ef476f',
    chest: '#073b4c',
    chestAccent: '#118ab2',
    gold: '#ffd60a',
  },
  forest: {
    bg: '#0a1a0a',
    floor: '#2d4a1c',
    floorAlt: '#1e3a0f',
    wall: '#5a3825',
    wallDark: '#3a2815',
    player: '#90ee90',
    enemy1: '#228b22',
    enemy2: '#8b4513',
    enemy3: '#2f4f4f',
    boss1: '#8b0000',
    boss2: '#4b0082',
    coin: '#ffd700',
    potion1: '#ff6b6b',
    potion2: '#4ecdc4',
    key: '#daa520',
    chest: '#8b4513',
    chestAccent: '#a0522d',
    gold: '#ffd700',
  },
  volcano: {
    bg: '#1a0505',
    floor: '#3d1a0a',
    floorAlt: '#2d1008',
    wall: '#5a2010',
    wallDark: '#3a1508',
    player: '#ffaa00',
    enemy1: '#ff4500',
    enemy2: '#8b0000',
    enemy3: '#2f1f1f',
    boss1: '#ff0000',
    boss2: '#8b008b',
    coin: '#ffd700',
    potion1: '#ff6347',
    potion2: '#20b2aa',
    key: '#daa520',
    chest: '#8b4513',
    chestAccent: '#a0522d',
    gold: '#ffd700',
  },
}

function generateFloor(ctx, w, h, c) {
  ctx.fillStyle = c.floor
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = c.floorAlt
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(Math.random() * w * 0.8, Math.random() * h * 0.8, 2, 2)
  }
}

function generateWall(ctx, w, h, c, side) {
  ctx.fillStyle = c.wall
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = c.wallDark
  if (side === 'top') ctx.fillRect(0, h - 4, w, 4)
  else if (side === 'bottom') ctx.fillRect(0, 0, w, 4)
  else if (side === 'left') ctx.fillRect(w - 4, 0, 4, h)
  else if (side === 'right') ctx.fillRect(0, 0, 4, h)
}

function generatePlayer(ctx, w, h, c) {
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = c.player
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, w / 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(w / 2 - 2, h / 2 - 2, 2, 0, Math.PI * 2)
  ctx.fill()
}

function generateEnemy(ctx, w, h, c, type) {
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, w, h)
  if (type === 1) {
    ctx.fillStyle = c.enemy1
    ctx.beginPath()
    ctx.ellipse(w / 2, h * 0.6, w / 3, h / 3, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (type === 2) {
    ctx.fillStyle = c.enemy2
    ctx.fillRect(w * 0.3, h * 0.2, w * 0.4, h * 0.3)
    ctx.fillRect(w * 0.35, h * 0.5, w * 0.3, h * 0.4)
  } else {
    ctx.fillStyle = c.enemy3
    ctx.beginPath()
    ctx.ellipse(w / 2, h / 2, w / 4, h / 4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(0, h * 0.3, w * 0.3, h * 0.2)
    ctx.fillRect(w * 0.7, h * 0.3, w * 0.3, h * 0.2)
  }
}

function generateBoss(ctx, w, h, c, type) {
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = type === 1 ? c.boss1 : c.boss2
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, w / 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = type === 1 ? '#ff6666' : '#aa66ff'
  ctx.fillRect(w * 0.2, h * 0.2, w * 0.2, h * 0.15)
  ctx.fillRect(w * 0.6, h * 0.2, w * 0.2, h * 0.15)
}

function generateCoin(ctx, w, h, c) {
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = c.coin
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, w / 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = c.gold
  ctx.beginPath()
  ctx.arc(w / 3, h / 3, 2, 0, Math.PI * 2)
  ctx.fill()
}

function generatePotion(ctx, w, h, c, type) {
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#505060'
  ctx.fillRect(w * 0.35, h * 0.1, w * 0.3, h * 0.25)
  ctx.fillStyle = type === 1 ? c.potion1 : c.potion2
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 0.65, w * 0.3, h * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()
}

function generateKey(ctx, w, h, c) {
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = c.key
  ctx.beginPath()
  ctx.arc(w * 0.35, h * 0.35, w * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(w * 0.45, h * 0.3, w * 0.15, h * 0.1)
  ctx.fillRect(w * 0.5, h * 0.4, w * 0.2, h * 0.1)
  ctx.fillRect(w * 0.55, h * 0.5, w * 0.15, h * 0.1)
}

function generateChest(ctx, w, h, c, open) {
  ctx.fillStyle = c.bg
  ctx.fillRect(0, 0, w, h)
  if (open) {
    ctx.fillStyle = c.chest
    ctx.fillRect(w * 0.1, h * 0.5, w * 0.8, h * 0.4)
    ctx.fillStyle = c.gold
    ctx.fillRect(w * 0.2, h * 0.55, w * 0.6, h * 0.3)
    ctx.fillStyle = c.chestAccent
    ctx.save()
    ctx.transform(1, -0.3, 0, 1, 0, 0)
    ctx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.3)
    ctx.restore()
  } else {
    ctx.fillStyle = c.chest
    ctx.fillRect(w * 0.1, h * 0.4, w * 0.8, h * 0.5)
    ctx.fillStyle = c.chestAccent
    ctx.fillRect(w * 0.1, h * 0.2, w * 0.8, h * 0.3)
    ctx.fillStyle = c.gold
    ctx.fillRect(w * 0.35, h * 0.35, w * 0.3, h * 0.15)
  }
}

console.log('Generating sprites for all styles...\n')

for (const [styleName, colors] of Object.entries(styles)) {
  console.log(`🎨 Generating ${styleName} style...`)
  const styleDir = join(SPRITES_DIR, styleName)
  
  const sprites = {
    'tiles/floor_0.png': (ctx, w, h) => generateFloor(ctx, w, h, colors),
    'tiles/floor_1.png': (ctx, w, h) => {
      ctx.fillStyle = colors.floorAlt
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = colors.floor
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(Math.random() * w * 0.8, Math.random() * h * 0.8, 3, 2)
      }
    },
    'tiles/wall_top.png': (ctx, w, h) => generateWall(ctx, w, h, colors, 'top'),
    'tiles/wall_bottom.png': (ctx, w, h) => generateWall(ctx, w, h, colors, 'bottom'),
    'tiles/wall_left.png': (ctx, w, h) => generateWall(ctx, w, h, colors, 'left'),
    'tiles/wall_right.png': (ctx, w, h) => generateWall(ctx, w, h, colors, 'right'),
    'characters/player.png': (ctx, w, h) => generatePlayer(ctx, w, h, colors),
    'characters/enemies/slime.png': (ctx, w, h) => generateEnemy(ctx, w, h, colors, 1),
    'characters/enemies/skeleton.png': (ctx, w, h) => generateEnemy(ctx, w, h, colors, 2),
    'characters/enemies/bat.png': (ctx, w, h) => generateEnemy(ctx, w, h, colors, 3),
    'characters/enemies/boss_demon.png': (ctx, w, h) => generateBoss(ctx, w, h, colors, 1),
    'characters/enemies/boss_dragon.png': (ctx, w, h) => generateBoss(ctx, w, h, colors, 2),
    'items/coin.png': (ctx, w, h) => generateCoin(ctx, w, h, colors),
    'items/potion_red.png': (ctx, w, h) => generatePotion(ctx, w, h, colors, 1),
    'items/potion_blue.png': (ctx, w, h) => generatePotion(ctx, w, h, colors, 2),
    'items/key.png': (ctx, w, h) => generateKey(ctx, w, h, colors),
    'items/chest_closed.png': (ctx, w, h) => generateChest(ctx, w, h, colors, false),
    'items/chest_open.png': (ctx, w, h) => generateChest(ctx, w, h, colors, true),
  }

  let count = 0
  for (const [path, drawFn] of Object.entries(sprites)) {
    const fullPath = join(styleDir, path)
    ensureDir(dirname(fullPath))
    
    const size = path.includes('boss') ? 32 : 16
    const png = createPNG(size, size, drawFn)
    writeFileSync(fullPath, png)
    count++
  }
  console.log(`  ✅ Generated ${count} sprites\n`)
}

console.log('🎉 All sprites generated successfully!')
