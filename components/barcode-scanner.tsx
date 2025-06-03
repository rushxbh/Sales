"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Camera, Scan, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState("")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      setStream(mediaStream)
      setIsScanning(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      toast({
        title: "Camera Started",
        description: "Point camera at barcode to scan",
      })
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim())
      setManualBarcode("")
    }
  }

  const simulateScan = () => {
    // Simulate barcode detection for demo
    const mockBarcodes = ["1234567890123", "9876543210987", "5555666677778", "1111222233334"]
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)]

    toast({
      title: "Barcode Detected",
      description: `Scanned: ${randomBarcode}`,
    })

    onScan(randomBarcode)
    stopCamera()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Scan className="h-5 w-5" />
              <span>Barcode Scanner</span>
            </CardTitle>
            <CardDescription>Scan or enter barcode manually</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Scanner */}
        <div className="space-y-3">
          <Label>Camera Scanner</Label>
          {!isScanning ? (
            <Button onClick={startCamera} className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-48 object-cover" />
                <div className="absolute inset-0 border-2 border-red-500 border-dashed m-8 rounded-lg"></div>
                <Badge className="absolute top-2 left-2 bg-red-500">Scanning...</Badge>
              </div>
              <div className="flex space-x-2">
                <Button onClick={simulateScan} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Simulate Scan
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Stop
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="space-y-3">
          <Label>Manual Entry</Label>
          <form onSubmit={handleManualSubmit} className="flex space-x-2">
            <Input
              placeholder="Enter barcode number"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!manualBarcode.trim()}>
              <Check className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Point camera at barcode for automatic scanning</p>
          <p>• Ensure good lighting and steady hands</p>
          <p>• Use manual entry if camera scanning fails</p>
        </div>
      </CardContent>
    </Card>
  )
}
