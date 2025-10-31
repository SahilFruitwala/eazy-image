"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DownloadSectionProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  format: string
  quality: number
}

export function DownloadSection({ canvasRef, format, quality }: DownloadSectionProps) {
  const [copied, setCopied] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState("")

  const getMimeType = (fmt: string) => {
    const mimeTypes: { [key: string]: string } = {
      png: "image/png",
      jpeg: "image/jpeg",
      webp: "image/webp",
      bmp: "image/bmp",
    }
    return mimeTypes[fmt] || "image/png"
  }

  const getFileExtension = (fmt: string) => {
    const extensions: { [key: string]: string } = {
      jpeg: "jpg",
      png: "png",
      webp: "webp",
      bmp: "bmp",
    }
    return extensions[fmt] || "png"
  }

  const handleDownload = async () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const link = document.createElement("a")
    const mimeType = getMimeType(format)
    const ext = getFileExtension(format)

    setDownloadStatus("Preparing...")

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setDownloadStatus("Error preparing file")
          return
        }
        const url = URL.createObjectURL(blob)
        link.href = url
        link.download = `image_${Date.now()}.${ext}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setDownloadStatus("Downloaded!")
        setTimeout(() => setDownloadStatus(""), 2000)
      },
      mimeType,
      format === "jpeg" || format === "webp" ? quality / 100 : undefined,
    )
  }

  const handleCopyAsDataUrl = async () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL(getMimeType(format), quality / 100)

    try {
      await navigator.clipboard.writeText(dataUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleExportAsUrl = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL(getMimeType(format), quality / 100)
    window.open("data:text/html,<pre>" + encodeURIComponent(dataUrl) + "</pre>", "_blank")
  }

  const getFileSize = () => {
    if (!canvasRef.current) return "0 KB"
    const estimatedSize = canvasRef.current.width * canvasRef.current.height * 3 * (1 - quality / 100)
    return `~${Math.round(estimatedSize / 1024)} KB`
  }

  return (
    <div className="space-y-3">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Estimated File Size</p>
            <p className="text-lg font-bold text-white">{getFileSize()}</p>
          </div>

          <Button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white"
          >
            {"⬇"} {downloadStatus || `Download ${format.toUpperCase()}`}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleCopyAsDataUrl} variant="outline" className="bg-transparent text-xs">
              {copied ? "✓ Copied!" : "📋 Copy Data URL"}
            </Button>

            <Button onClick={handleExportAsUrl} variant="outline" className="bg-transparent text-xs">
              {"⬇"} View as URL
            </Button>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-2">Export Details</p>
            <div className="space-y-1">
              <p>
                Format: <span className="text-cyan-400 font-semibold">{format.toUpperCase()}</span>
              </p>
              <p>
                Quality: <span className="text-cyan-400 font-semibold">{quality}%</span>
              </p>
              <p>
                Dimensions:{" "}
                <span className="text-cyan-400 font-semibold">
                  {canvasRef.current?.width}x{canvasRef.current?.height}px
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700 p-4">
        <h4 className="text-xs font-semibold text-slate-300 mb-3">Export Options</h4>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="p-2 rounded bg-slate-800/50 border-l-2 border-cyan-400">
            <p className="font-semibold text-slate-200">⬇ Download File</p>
            <p className="text-slate-500">Save as {format.toUpperCase()} file to your computer</p>
          </div>
          <div className="p-2 rounded bg-slate-800/50 border-l-2 border-blue-400">
            <p className="font-semibold text-slate-200">📋 Copy Data URL</p>
            <p className="text-slate-500">Copy data URL for web use or sharing</p>
          </div>
          <div className="p-2 rounded bg-slate-800/50 border-l-2 border-cyan-400">
            <p className="font-semibold text-slate-200">⬇ View as URL</p>
            <p className="text-slate-500">View the data URL in a new window</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
