"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { X, Camera } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (codigo: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader;

    const startScanning = async () => {
      codeReader = new BrowserMultiFormatReader();
      
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        // Intentar usar la cámara trasera por defecto en móviles
        const backCamera = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('trasera')
        );
        
        const deviceId = backCamera ? backCamera.deviceId : videoInputDevices[0]?.deviceId;

        if (deviceId && videoRef.current) {
          codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
            if (result && isScanning) {
              setIsScanning(false);
              // Reproducir un pequeño beep al leer (opcional, mejora UX)
              try {
                const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
                audio.play().catch(() => {});
              } catch (e) {}
              
              onScan(result.getText());
            }
            if (err && !(err instanceof NotFoundException)) {
              console.error(err);
            }
          });
        } else {
          setError("No se detectó ninguna cámara en este dispositivo.");
        }
      } catch (err) {
        console.error("Error al iniciar el escáner:", err);
        setError("Permiso de cámara denegado o error al iniciar la cámara.");
      }
    };

    startScanning();

    // Limpieza al desmontar el componente
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [onScan, isScanning]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
      {/* Botón de cerrar */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X size={24} />
      </button>

      <div className="text-center text-white mb-6">
        <Camera size={32} className="mx-auto mb-2 opacity-80" />
        <h2 className="text-xl font-bold">Escáner de Códigos</h2>
        <p className="text-sm text-gray-300 mt-1">Apunta la cámara al código de barras del producto</p>
      </div>

      {/* Contenedor del Video */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover"
        />
        
        {/* Guía visual de escaneo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-32 border-2 border-red-500 rounded-lg relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_red] opacity-60 animate-pulse"></div>
          </div>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-gray-400 text-xs text-center max-w-xs">
        Asegúrate de tener buena iluminación y que el código esté dentro del cuadro rojo.
      </div>
    </div>
  );
}
