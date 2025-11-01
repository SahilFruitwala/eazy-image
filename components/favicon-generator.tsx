"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface FaviconGeneratorProps {
  image: HTMLImageElement | null
}

const FAVICON_SIZES = [
  { size: 16, name: "favicon-16x16.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 48, name: "favicon-48x48.png" },
  { size: 96, name: "favicon-96x96.png" },
  { size: 128, name: "favicon-128x128.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "android-chrome-192x192.png" },
  { size: 512, name: "android-chrome-512x512.png" },
]

// sizes to include inside the .ico (common set)
const ICO_SIZES = [16, 32, 48, 64, 128, 256]

export function FaviconGenerator({ image }: FaviconGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  // helper: create PNG blob from canvas at given size using the provided image
  const createPngBlobFromImage = (img: HTMLImageElement, size: number): Promise<Blob> => {
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) return Promise.reject(new Error("Could not get canvas context"))
    ctx.drawImage(img, 0, 0, size, size)
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b)
        else reject(new Error("Canvas toBlob returned null"))
      }, "image/png")
    })
  }

  // helper: read blob as ArrayBuffer
  const blobToArrayBuffer = (b: Blob): Promise<ArrayBuffer> =>
    new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as ArrayBuffer)
      r.onerror = () => rej(r.error)
      r.readAsArrayBuffer(b)
    })

  // Build ICO file from PNG blobs (ICO format supports PNG images embedded)
  // Reference: ICO header + directory entries + concatenated image data
  // For PNG images, set planes=0 and bitCount=0 per practice.
  const buildIcoFromPngBlobs = async (pngBlobs: { size: number; blob: Blob }[]) => {
    // Read all blobs to ArrayBuffers
    const buffers = await Promise.all(
      pngBlobs.map(async (p) => ({ size: p.size, buffer: await blobToArrayBuffer(p.blob) }))
    )

    // ICO header: 6 bytes
    // 0-1 reserved (0), 2-3 image type (1 for ICO), 4-5 image count
    const count = buffers.length
    const dirEntrySize = 16
    const headerSize = 6
    const directorySize = count * dirEntrySize

    // compute total size = header + directory + sum(image sizes)
    const imagesByteLength = buffers.reduce((s, b) => s + b.buffer.byteLength, 0)
    const totalSize = headerSize + directorySize + imagesByteLength

    const out = new ArrayBuffer(totalSize)
    const dv = new DataView(out)
    let offset = 0

    // write header
    dv.setUint16(offset, 0, true) // reserved
    offset += 2
    dv.setUint16(offset, 1, true) // type = 1 (ICO)
    offset += 2
    dv.setUint16(offset, count, true) // count
    offset += 2

    // directory entries
    // each: 1 byte width, 1 byte height, 1 byte colorCount, 1 byte reserved,
    // 2 bytes planes, 2 bytes bitCount, 4 bytes bytesInRes, 4 bytes imageOffset
    let imageOffset = headerSize + directorySize
    for (let i = 0; i < buffers.length; i++) {
      const { size } = buffers[i]
      const bytesInRes = buffers[i].buffer.byteLength

      // width and height: if size === 256 write 0 per ICO spec (0 means 256)
      dv.setUint8(offset, size === 256 ? 0 : size)
      offset += 1
      dv.setUint8(offset, size === 256 ? 0 : size)
      offset += 1

      dv.setUint8(offset, 0) // colorCount (0 if >=8bpp or PNG)
      offset += 1
      dv.setUint8(offset, 0) // reserved
      offset += 1

      dv.setUint16(offset, 0, true) // planes (0 for PNG image in ICO)
      offset += 2
      dv.setUint16(offset, 0, true) // bitCount (0 for PNG)
      offset += 2

      dv.setUint32(offset, bytesInRes, true) // bytes in resource
      offset += 4
      dv.setUint32(offset, imageOffset, true) // image offset
      offset += 4

      imageOffset += bytesInRes
    }

    // copy image bytes
    let writePtr = headerSize + directorySize
    for (const b of buffers) {
      const src = new Uint8Array(b.buffer)
      const dest = new Uint8Array(out, writePtr, src.length)
      dest.set(src)
      writePtr += src.length
    }

    return new Blob([out], { type: "image/x-icon" })
  }

  const generateFavicons = async () => {
    if (!image) return
    setIsGenerating(true)
    const zip = new JSZip()

    // generate PNG favicons and collect blobs for ICO
    const icoCandidates: { size: number; blob: Blob }[] = []

    for (const { size, name } of FAVICON_SIZES) {
      try {
        const blob = await createPngBlobFromImage(image, size)
        zip.file(name, blob)
        // if this size is in the ICO sizes list, add to icoCandidates
        if (ICO_SIZES.includes(size)) {
          icoCandidates.push({ size, blob })
        }
      } catch (e) {
        // skip on error for a specific size
        // eslint-disable-next-line no-console
        console.warn("Failed to create png for size", size, e)
      }
    }

    // make sure we have at least one image for ICO
    if (icoCandidates.length > 0) {
      // ensure we include unique sizes sorted ascending (common ICO layout)
      const unique = Array.from(
        new Map(icoCandidates.map((c) => [c.size, c])).values()
      ).sort((a, b) => a.size - b.size)

      // if 256 isn't present, create a 256 version (use original image scaled)
      if (!unique.some((u) => u.size === 256)) {
        try {
          const blob256 = await createPngBlobFromImage(image, 256)
          unique.push({ size: 256, blob: blob256 })
          unique.sort((a, b) => a.size - b.size)
        } catch {
          // ignore
        }
      }

      try {
        const icoBlob = await buildIcoFromPngBlobs(unique)
        zip.file("favicon.ico", icoBlob)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to build ICO:", e)
      }
    }

    // generate zip and save
    try {
      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, "favicons.zip")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Favicon Generator</h3>
        <div className="space-y-2">
          <Button onClick={generateFavicons} disabled={isGenerating} className="w-full">
            {isGenerating ? "Generating..." : "Generate & Download Favicons"}
          </Button>
        </div>
      </div>
    </div>
  )
}