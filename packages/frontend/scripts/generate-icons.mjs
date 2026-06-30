import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('public/icons/pokeball.svg')

const sizes = [64, 144, 180, 192, 512]

for (const size of sizes) {
  const name = size === 180 ? 'apple-touch-icon' : `icon-${size}x${size}`
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`public/icons/${name}.png`)
  console.log(`Generated ${name}.png`)
}
