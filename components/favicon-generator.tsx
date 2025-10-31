"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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

export function FaviconGenerator({ image }: FaviconGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateFavicons = async () => {
    if (!image) return

    setIsGenerating(true)
    const zip = new JSZip()

    for (const { size, name } of FAVICON_SIZES) {
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) continue

      ctx.drawImage(image, 0, 0, size, size)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
      if (blob) {
        zip.file(name, blob)
      }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "favicons.zip")
      setIsGenerating(false)
    })
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
