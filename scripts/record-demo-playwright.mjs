#!/usr/bin/env node
import { mkdir, rename, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright'

const baseUrl = process.env.DEMO_BASE_URL || 'http://localhost:3000'
const outPath = process.argv[2] || 'tmp/demo-stable-final.webm'
const outDir = path.dirname(outPath)
const outName = path.basename(outPath)
const videoDir = path.join(outDir, '.playwright-video-temp')

await mkdir(videoDir, { recursive: true })
await mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
})
const page = await context.newPage()

async function wait(ms) {
  await page.waitForTimeout(ms)
}

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await wait(500)

  const worldButton = page.getByRole('button', { name: '🏝️ 荒岛求生' })
  if (await worldButton.isVisible()) {
    await worldButton.click()
  }

  await wait(12000)

  const detailBtn = page.getByRole('button', { name: /展开细节|收起详情/ }).first()
  if (await detailBtn.isVisible().catch(() => false)) {
    await detailBtn.click().catch(() => {})
    await wait(1200)
  }

  const input = page.getByPlaceholder('输入干预或争论议题...')
  if (await input.isVisible().catch(() => false)) {
    await input.fill('立即修复供水系统并校准能源模块')
    await page.getByRole('button', { name: 'EXECUTE' }).click().catch(() => {})
  }

  await wait(14000)
  await page.mouse.wheel(0, 700)
  await wait(1800)
  await page.mouse.wheel(0, 500)
  await wait(5000)
} finally {
  await context.close()
  await browser.close()
}

const files = await readdir(videoDir)
const webm = files.find((f) => f.endsWith('.webm'))
if (!webm) {
  throw new Error('Playwright did not produce a video file')
}

await rename(path.join(videoDir, webm), path.join(outDir, outName))
console.log(`Saved demo video: ${path.join(outDir, outName)}`)
