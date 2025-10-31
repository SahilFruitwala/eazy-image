"use client"

import { Card } from "@/components/ui/card"

interface CompressionInfoProps {
  format: string
  quality: number
  width: number
  height: number
}

export function CompressionInfo({ format, quality, width, height }: CompressionInfoProps) {
  const estimateFileSize = () => {
    // Rough estimation: width * height * bytes per pixel * compression ratio
    const pixels = width * height
    const bytesPerPixel = 3 // RGB

    switch (format) {
      case "png":
        // PNG is typically less compressed than JPEG
        return Math.round(pixels * 1.5) / 1024 // ~1.5 bytes per pixel
      case "jpeg":
        // JPEG compression depends heavily on quality
        const jpegCompression = 1 - quality / 100
        return Math.round(pixels * 0.5 * (1 - jpegCompression * 0.7)) / 1024
      case "webp":
        // WebP is more efficient than both PNG and JPEG
        return Math.round(pixels * 0.8) / 1024
      case "gif":
        // GIF varies depending on image complexity
        return Math.round(pixels * 1.2) / 1024
      case "bmp":
        // BMP is uncompressed
        return Math.round(pixels * bytesPerPixel) / 1024
      default:
        return Math.round(pixels * 1.5) / 1024
    }
  }

  const getCompressionLevel = () => {
    if (quality >= 90) return "Very High"
    if (quality >= 70) return "High"
    if (quality >= 50) return "Medium"
    if (quality >= 30) return "Low"
    return "Very Low"
  }

  const getFormatInfo = () => {
    const info: { [key: string]: string } = {
      png: "PNG offers lossless compression. Best for graphics with transparency.",
      jpeg: "JPEG uses lossy compression. Ideal for photographs and complex images.",
      webp: "WebP provides superior compression. Modern format with better file sizes.",
      gif: "GIF supports animation but limits colors. Good for simple animations.",
      bmp: "BMP is uncompressed. Largest file sizes, best for editing.",
    }
    return info[format] || ""
  }

  const fileSize = estimateFileSize()
  const megabytes = fileSize > 1024 ? (fileSize / 1024).toFixed(2) : fileSize.toFixed(2)
  const unit = fileSize > 1024 ? "MB" : "KB"

  return (
    <div className="space-y-3">
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 p-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Estimated File Size</p>
            <p className="text-2xl font-bold text-cyan-400">
              ~{megabytes} {unit}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-950/40 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Quality Level</p>
              <p className="font-semibold text-white">{getCompressionLevel()}</p>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Format</p>
              <p className="font-semibold text-white uppercase">{format}</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
            <p className="text-slate-300 font-semibold mb-1">Format Info</p>
            <p>{getFormatInfo()}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700 p-4">
        <h4 className="text-xs font-semibold text-slate-300 mb-3">Quality Recommendations</h4>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
            <span>Web Optimized</span>
            <span className="text-cyan-400 font-semibold">60-70%</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
            <span>Social Media</span>
            <span className="text-cyan-400 font-semibold">75-85%</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
            <span>Print Quality</span>
            <span className="text-cyan-400 font-semibold">90-100%</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-slate-800/50">
            <span>Maximum Compression</span>
            <span className="text-cyan-400 font-semibold">20-40%</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
