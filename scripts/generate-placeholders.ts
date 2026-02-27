import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const SPRITES_DIR = join(process.cwd(), 'public/sprites/dungeon')

function createPNG(width: number, height: number, color: [number, number, number], name: string): Buffer {
  const r = color[0], g = color[1], b = color[2]
  
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  
  function crc32(data: Buffer): number {
    let crc = 0xFFFFFFFF
    const table: number[] = []
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
      table[i] = c
    }
    for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
    return (crc ^ 0xFFFFFFFF) >>> 0
  }
  
  function createChunk(type: string, data: Buffer): Buffer {
    const typeBuffer = Buffer.from(type)
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const crcData = Buffer.concat([typeBuffer, data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(crcData))
    return Buffer.concat([length, typeBuffer, data, crc])
  }
  
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData.writeUInt8(8, 8)
  ihdrData.writeUInt8(2, 9)
  ihdrData.writeUInt8(0, 10)
  ihdrData.writeUInt8(0, 11)
  ihdrData.writeUInt8(0, 12)
  const ihdr = createChunk('IHDR', ihdrData)
  
  const rawData: number[] = []
  for (let y = 0; y < height; y++) {
    rawData.push(0)
    for (let x = 0; x < width; x++) {
      if (name.includes('floor')) {
        const isAlt = (x + y) % 3 === 0
        rawData.push(isAlt ? r : r - 10, isAlt ? g : g - 10, isAlt ? b : b - 10)
      } else if (name.includes('wall')) {
        const edge = x < 2 || x >= width - 2 || y < 2 || y >= height - 2
        rawData.push(edge ? r + 30 : r, edge ? g + 30 : g, edge ? b + 30 : b)
      } else if (name.includes('player')) {
        const cx = width / 2, cy = height / 2
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        if (dist < width / 3) {
          rawData.push(r, g, b)
        } else {
          rawData.push(20, 20, 30)
        }
      } else if (name.includes('slime')) {
        const cx = width / 2, cy = height * 0.6
        const dist = Math.sqrt((x - cx) ** 2 + ((y - cy) * 1.5) ** 2)
        rawData.push(dist < width / 3 ? r : 20, dist < width / 3 ? g : 30, dist < width / 3 ? b : 20)
      } else if (name.includes('skeleton')) {
        const isBone = (x > width * 0.3 && x < width * 0.7) || (y > height * 0.2 && y < height * 0.4)
        rawData.push(isBone ? 230 : 30, isBone ? 220 : 30, isBone ? 200 : 40)
      } else if (name.includes('bat')) {
        const isWing = (x < width * 0.3 || x > width * 0.7) && y < height * 0.5
        const isBody = x > width * 0.35 && x < width * 0.65 && y > height * 0.3
        rawData.push(isWing || isBody ? r : 15, isWing || isBody ? g : 15, isWing || isBody ? b : 20)
      } else if (name.includes('boss') || name.includes('demon') || name.includes('dragon')) {
        const cx = width / 2, cy = height / 2
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        const angle = Math.atan2(y - cy, x - cx)
        const stripe = Math.sin(angle * 4) > 0
        if (dist < width / 2.5) {
          rawData.push(stripe ? r + 40 : r, stripe ? g : g + 20, b)
        } else {
          rawData.push(15, 10, 20)
        }
      } else if (name.includes('coin')) {
        const cx = width / 2, cy = height / 2
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        const shine = x < width / 3 && y < height / 3
        rawData.push(dist < width / 3 ? (shine ? 255 : r) : 20, dist < width / 3 ? (shine ? 230 : g) : 20, dist < width / 3 ? 0 : 20)
      } else if (name.includes('potion_red')) {
        const isLiquid = y > height * 0.4 && x > width * 0.25 && x < width * 0.75
        const isGlass = x > width * 0.2 && x < width * 0.8
        rawData.push(isLiquid ? r : (isGlass ? 60 : 20), isLiquid ? g : (isGlass ? 80 : 25), isLiquid ? b : (isGlass ? 100 : 30))
      } else if (name.includes('potion_blue')) {
        const isLiquid = y > height * 0.4 && x > width * 0.25 && x < width * 0.75
        const isGlass = x > width * 0.2 && x < width * 0.8
        rawData.push(isLiquid ? 50 : (isGlass ? 60 : 20), isLiquid ? 100 : (isGlass ? 80 : 25), isLiquid ? 200 : (isGlass ? 100 : 30))
      } else if (name.includes('key')) {
        const isKey = (x > width * 0.4 && x < width * 0.6) || (y > height * 0.6 && x > width * 0.3 && x < width * 0.7)
        rawData.push(isKey ? r : 30, isKey ? g : 30, isKey ? b : 35)
      } else if (name.includes('chest')) {
        const isLid = y < height * 0.45
        const isBody = y >= height * 0.45 && y < height * 0.85
        const isGold = (x > width * 0.3 && x < width * 0.7) && (y > height * 0.35 && y < height * 0.55)
        rawData.push(
          isGold ? 255 : (isLid ? r - 20 : (isBody ? r : 40)),
          isGold ? 215 : (isLid ? g - 20 : (isBody ? g : 30)),
          isGold ? 0 : (isLid ? b - 20 : (isBody ? b : 25))
        )
      } else {
        rawData.push(r, g, b)
      }
    }
  }
  
  const rawBuffer = Buffer.from(rawData)
  
  const zlib = require('zlib')
  const compressed = zlib.deflateSync(rawBuffer)
  const idat = createChunk('IDATA', compressed)
  
  const iend = createChunk('IEND', Buffer.alloc(0))
  
  return Buffer.concat([signature, ihdr, idat, iend])
}

const sprites = {
  'tiles/floor_0.png': { size: 16, color: [60, 55, 50] as [number, number, number] },
  'tiles/floor_1.png': { size: 16, color: [55, 50, 45] as [number, number, number] },
  'tiles/wall_top.png': { size: 16, color: [80, 75, 85] as [number, number, number] },
  'tiles/wall_bottom.png': { size: 16, color: [50, 45, 55] as [number, number, number] },
  'tiles/wall_left.png': { size: 16, color: [70, 65, 75] as [number, number, number] },
  'tiles/wall_right.png': { size: 16, color: [70, 65, 75] as [number, number, number] },
  'characters/player.png': { size: 16, color: [100, 180, 255] as [number, number, number] },
  'characters/enemies/slime.png': { size: 16, color: [100, 200, 100] as [number, number, number] },
  'characters/enemies/skeleton.png': { size: 16, color: [200, 190, 180] as [number, number, number] },
  'characters/enemies/bat.png': { size: 16, color: [80, 60, 100] as [number, number, number] },
  'characters/enemies/boss_demon.png': { size: 32, color: [180, 50, 50] as [number, number, number] },
  'characters/enemies/boss_dragon.png': { size: 32, color: [150, 80, 180] as [number, number, number] },
  'items/coin.png': { size: 12, color: [255, 200, 50] as [number, number, number] },
  'items/potion_red.png': { size: 12, color: [220, 50, 50] as [number, number, number] },
  'items/potion_blue.png': { size: 12, color: [50, 100, 220] as [number, number, number] },
  'items/key.png': { size: 12, color: [200, 180, 50] as [number, number, number] },
  'items/chest_closed.png': { size: 16, color: [150, 100, 50] as [number, number, number] },
  'items/chest_open.png': { size: 16, color: [150, 100, 50] as [number, number, number] },
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

console.log('Generating placeholder sprites...')

for (const [path, config] of Object.entries(sprites)) {
  const fullPath = join(SPRITES_DIR, path)
  const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))
  ensureDir(dir)
  
  const png = createPNG(config.size, config.size, config.color, path)
  writeFileSync(fullPath, png)
  console.log(`  Created: ${path}`)
}

console.log('\nDone! All placeholder sprites generated.')
