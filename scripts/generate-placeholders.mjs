import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPRITES_DIR = join(__dirname, '../public/sprites/dungeon')

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function createPNG(width, height, drawFn) {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  drawFn(ctx, width, height)
  return canvas.toBuffer('image/png')
}

const sprites = {
  'tiles/floor_0.png': (ctx, w, h) => {
    ctx.fillStyle = '#3a3632'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2e2a26'
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    }
  },
  'tiles/floor_1.png': (ctx, w, h) => {
    ctx.fillStyle = '#35312d'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a2622'
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 3, 2)
    }
  },
  'tiles/wall_top.png': (ctx, w, h) => {
    ctx.fillStyle = '#4a4650'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#5a5660'
    ctx.fillRect(0, h - 4, w, 4)
  },
  'tiles/wall_bottom.png': (ctx, w, h) => {
    ctx.fillStyle = '#3a3640'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2a2630'
    ctx.fillRect(0, 0, w, 4)
  },
  'tiles/wall_left.png': (ctx, w, h) => {
    ctx.fillStyle = '#454150'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#555160'
    ctx.fillRect(w - 4, 0, 4, h)
  },
  'tiles/wall_right.png': (ctx, w, h) => {
    ctx.fillStyle = '#454150'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#555160'
    ctx.fillRect(0, 0, 4, h)
  },
  'characters/player.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f0f1a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#64b4ff'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w / 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(w / 2 - 2, h / 2 - 2, 2, 0, Math.PI * 2)
    ctx.fill()
  },
  'characters/enemies/slime.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f1a0f'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#64c864'
    ctx.beginPath()
    ctx.ellipse(w / 2, h * 0.6, w / 3, h / 3, 0, 0, Math.PI * 2)
    ctx.fill()
  },
  'characters/enemies/skeleton.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f0f1a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#e6dcc8'
    ctx.fillRect(w * 0.3, h * 0.2, w * 0.4, h * 0.3)
    ctx.fillRect(w * 0.35, h * 0.5, w * 0.3, h * 0.4)
  },
  'characters/enemies/bat.png': (ctx, w, h) => {
    ctx.fillStyle = '#0a0a14'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#504064'
    ctx.beginPath()
    ctx.ellipse(w / 2, h / 2, w / 4, h / 4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(0, h * 0.3, w * 0.3, h * 0.2)
    ctx.fillRect(w * 0.7, h * 0.3, w * 0.3, h * 0.2)
  },
  'characters/enemies/boss_demon.png': (ctx, w, h) => {
    ctx.fillStyle = '#0a0510'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#b43232'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w / 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ff4444'
    ctx.fillRect(w * 0.2, h * 0.2, w * 0.2, h * 0.15)
    ctx.fillRect(w * 0.6, h * 0.2, w * 0.2, h * 0.15)
  },
  'characters/enemies/boss_dragon.png': (ctx, w, h) => {
    ctx.fillStyle = '#0a0510'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#9650b4'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w / 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#c878ff'
    ctx.fillRect(w * 0.1, h * 0.15, w * 0.25, h * 0.1)
    ctx.fillRect(w * 0.65, h * 0.15, w * 0.25, h * 0.1)
  },
  'items/coin.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f0f14'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffc832'
    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w / 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ffe064'
    ctx.beginPath()
    ctx.arc(w / 3, h / 3, 2, 0, Math.PI * 2)
    ctx.fill()
  },
  'items/potion_red.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f0f14'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#505060'
    ctx.fillRect(w * 0.35, h * 0.1, w * 0.3, h * 0.25)
    ctx.fillStyle = '#dc3232'
    ctx.beginPath()
    ctx.ellipse(w / 2, h * 0.65, w * 0.3, h * 0.35, 0, 0, Math.PI * 2)
    ctx.fill()
  },
  'items/potion_blue.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f0f14'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#505060'
    ctx.fillRect(w * 0.35, h * 0.1, w * 0.3, h * 0.25)
    ctx.fillStyle = '#3264dc'
    ctx.beginPath()
    ctx.ellipse(w / 2, h * 0.65, w * 0.3, h * 0.35, 0, 0, Math.PI * 2)
    ctx.fill()
  },
  'items/key.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f0f14'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c8b432'
    ctx.beginPath()
    ctx.arc(w * 0.35, h * 0.35, w * 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(w * 0.45, h * 0.3, w * 0.15, h * 0.1)
    ctx.fillRect(w * 0.5, h * 0.4, w * 0.2, h * 0.1)
    ctx.fillRect(w * 0.55, h * 0.5, w * 0.15, h * 0.1)
  },
  'items/chest_closed.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f0f14'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#8b5a2b'
    ctx.fillRect(w * 0.1, h * 0.4, w * 0.8, h * 0.5)
    ctx.fillStyle = '#a0522d'
    ctx.fillRect(w * 0.1, h * 0.2, w * 0.8, h * 0.3)
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(w * 0.35, h * 0.35, w * 0.3, h * 0.15)
  },
  'items/chest_open.png': (ctx, w, h) => {
    ctx.fillStyle = '#0f0f14'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#8b5a2b'
    ctx.fillRect(w * 0.1, h * 0.5, w * 0.8, h * 0.4)
    ctx.fillStyle = '#ffd700'
    ctx.fillRect(w * 0.2, h * 0.55, w * 0.6, h * 0.3)
    ctx.fillStyle = '#a0522d'
    ctx.save()
    ctx.transform(1, -0.3, 0, 1, 0, 0)
    ctx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.3)
    ctx.restore()
  },
}

console.log('Generating placeholder sprites with canvas...')

for (const [path, drawFn] of Object.entries(sprites)) {
  const fullPath = join(SPRITES_DIR, path)
  ensureDir(dirname(fullPath))
  
  const size = path.includes('boss') ? 32 : 16
  const png = createPNG(size, size, drawFn)
  writeFileSync(fullPath, png)
  console.log(`  Created: ${path}`)
}

console.log('\nDone! All placeholder sprites generated.')
