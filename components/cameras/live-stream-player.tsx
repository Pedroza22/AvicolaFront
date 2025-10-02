"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Camera,
  Wifi,
  WifiOff,
  AlertCircle,
  Play,
  CreditCard as Record,
  Volume2,
  VolumeX,
  Maximize,
  RotateCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Camera as CameraType } from "@/lib/types"

interface LiveStreamPlayerProps {
  camera: CameraType
  className?: string
  autoPlay?: boolean
  showControls?: boolean
}

export function LiveStreamPlayer({ camera, className, autoPlay = true, showControls = true }: LiveStreamPlayerProps) {
  const [isLive, setIsLive] = useState(camera.status === "online")
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [connectionQuality, setConnectionQuality] = useState<"good" | "medium" | "poor">("good")
  const [retryCount, setRetryCount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Simular calidad de conexión
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      const qualities: Array<"good" | "medium" | "poor"> = ["good", "good", "good", "medium", "medium", "poor"]
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)]
      setConnectionQuality(randomQuality)
    }, 5000)

    return () => clearInterval(interval)
  }, [isLive])

  // Iniciar stream
  useEffect(() => {
    if (autoPlay && camera.status === "online") {
      startStream()
    }

    return () => {
      stopStream()
    }
  }, [camera.id, autoPlay])

  const startStream = async () => {
    try {
      // Aquí iría la lógica real para conectar al stream
      // Por ahora simulamos con un video de prueba
      const video = videoRef.current
      if (!video) return

      // En producción, aquí cargarías el stream real desde tu API
      // video.src = `${API_CONFIG.baseURL}${API_ENDPOINTS.cameras.stream(camera.id)}`

      // Para demo, usamos un video de placeholder
      video.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

      await video.play()
      setIsLive(true)
      setRetryCount(0)
    } catch (error) {
      console.error("Error starting stream:", error)
      handleStreamError()
    }
  }

  const stopStream = () => {
    const video = videoRef.current
    if (video) {
      video.pause()
      video.src = ""
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsLive(false)
  }

  const handleStreamError = () => {
    setIsLive(false)
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount((prev) => prev + 1)
        startStream()
      }, 3000)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Aquí iría la lógica para iniciar/detener grabación
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error)
    }
  }

  const refreshStream = () => {
    stopStream()
    setTimeout(startStream, 500)
  }

  const takeSnapshot = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `snapshot-${camera.name}-${Date.now()}.png`
          link.click()
          URL.revokeObjectURL(url)
        }
      })
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "good":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = () => {
    if (camera.status === "offline") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <WifiOff className="h-3 w-3 mr-1" />
          Desconectada
        </Badge>
      )
    }
    if (camera.status === "warning") {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Advertencia
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Wifi className="h-3 w-3 mr-1" />
        En vivo
      </Badge>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Video Container */}
        <div className="relative aspect-video bg-black group">
          {camera.status === "online" || camera.status === "warning" ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted={isMuted}
                playsInline
                loop
                onError={handleStreamError}
              />

              {/* Live Indicator */}
              {isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge className="bg-red-600 text-white border-0 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full mr-2" />
                    EN VIVO
                  </Badge>
                  <div className={cn("w-2 h-2 rounded-full", getQualityColor(connectionQuality))} />
                </div>
              )}

              {/* Camera Info */}
              <div className="absolute top-3 right-3">{getStatusBadge()}</div>

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-12 left-3">
                  <Badge className="bg-red-600 text-white border-0">
                    <Record className="h-3 w-3 mr-1 animate-pulse" />
                    GRABANDO
                  </Badge>
                </div>
              )}

              {/* Controls Overlay */}
              {showControls && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!isLive ? (
                          <Button size="sm" variant="secondary" onClick={startStream}>
                            <Play className="h-3 w-3 mr-1" />
                            Reproducir
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="secondary" onClick={toggleRecording}>
                              <Record className={cn("h-3 w-3", isRecording && "text-red-500")} />
                            </Button>
                            <Button size="sm" variant="secondary" onClick={toggleMute}>
                              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={takeSnapshot}>
                              <Camera className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary" onClick={refreshStream}>
                          <RotateCw className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={toggleFullscreen}>
                          <Maximize className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connection Quality Info */}
              {isLive && connectionQuality === "poor" && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Calidad de conexión baja
                  </Badge>
                </div>
              )}
            </>
          ) : (
            // Offline State
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <WifiOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">Cámara desconectada</p>
                <p className="text-sm text-gray-400 mb-4">{camera.lastUpdate}</p>
                {retryCount > 0 && <p className="text-xs text-gray-500">Reintentando... ({retryCount}/3)</p>}
                <Button size="sm" variant="secondary" onClick={startStream} className="mt-4">
                  <RotateCw className="h-3 w-3 mr-2" />
                  Reconectar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Info Bar */}
        <div className="p-3 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{camera.name}</p>
              <p className="text-xs text-muted-foreground">{camera.location}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {camera.resolution} • {camera.fps}fps
              </p>
              <p className="text-xs text-muted-foreground">{camera.lastUpdate}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
