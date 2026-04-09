"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Package, AlertTriangle, CheckCircle2, ScanLine, X } from "lucide-react";
import { supabase } from "@/utils/supabase";
import clsx from "clsx";
import { BarcodeScanner } from "@/components/BarcodeScanner";

export default function InventarioPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Escáner
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null); // Producto encontrado
  const [scanError, setScanError] = useState<string>("");

  useEffect(() => {
    async function fetchInventario() {
      const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .order('nombre');

      if (!error && data) {
        setProductos(data);
      }
      setLoading(false);
    }
    fetchInventario();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  const handleScan = (codigo: string) => {
    setIsScanning(false); // Cerrar cámara
    setScanError("");
    setScanResult(null);

    // Buscar el producto en la lista local por código de barras
    const productoEncontrado = productos.find(p => p.codigo && p.codigo.toLowerCase() === codigo.toLowerCase());

    if (productoEncontrado) {
      setScanResult(productoEncontrado);
    } else {
      setScanError(`No se encontró ningún producto con el código: ${codigo}`);
    }
  };

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Modal Resultado de Escaneo Exitoso */}
      {scanResult && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-4 text-center relative">
              <button onClick={() => setScanResult(null)} className="absolute right-3 top-3 text-white/80 hover:text-white bg-blue-700 p-1 rounded-full"><X size={20}/></button>
              <Package size={40} className="mx-auto text-white mb-2" />
              <h2 className="text-xl font-bold text-white leading-tight">{scanResult.nombre}</h2>
              <p className="text-blue-100 text-sm mt-1 uppercase tracking-wider">{scanResult.codigo}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-medium">Precio Unitario</p>
                <p className="text-4xl font-black text-gray-900">{formatCurrency(scanResult.precio_unitario)}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-600 font-medium">En Bodega:</span>
                <span className={clsx("font-bold text-lg", scanResult.stock_actual < 20 ? "text-red-600" : "text-green-600")}>
                  {scanResult.stock_actual} <span className="text-xs font-normal lowercase">{scanResult.unidad_medida}</span>
                </span>
              </div>
              <button onClick={() => {setScanResult(null); setIsScanning(true);}} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <ScanLine size={18} /> Escanear otro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error de Escaneo */}
      {scanError && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
            <p className="text-gray-600 text-sm mb-6">{scanError}</p>
            <div className="flex gap-3">
              <button onClick={() => setScanError("")} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors">Cerrar</button>
              <button onClick={() => {setScanError(""); setIsScanning(true);}} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Componente Lector de Cámara */}
      {isScanning && (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Control de Inventario</h1>
          <p className="mt-1 text-sm text-gray-500">
            Revisa tu stock actual, precios y alertas de materiales agotándose.
          </p>
        </div>
        {/* Botón prominente de Escáner */}
        <button 
          onClick={() => setIsScanning(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium shadow-sm transition-all sm:w-auto w-full"
        >
          <ScanLine size={20} />
          Escanear Código
        </button>
      </div>

      {/* Grid de Inventario */}
      {loading ? (
        <div className="text-center py-16"><p className="text-gray-500">Cargando inventario...</p></div>
      ) : productos && productos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((producto: any) => {
            const isLowStock = producto.stock_actual < 20;

            return (
              <div key={producto.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="p-5 border-b border-gray-100 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                      {producto.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-medium">
                      Código: {producto.codigo || 'S/N'}
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50/50 flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Precio Unitario:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(producto.precio_unitario)}
                    </span>
                  </div>

                  <div className={clsx(
                    "flex justify-between items-center p-3 rounded-lg border shadow-sm",
                    isLowStock ? "bg-red-50 border-red-100" : "bg-white border-gray-100"
                  )}>
                    <span className="text-sm font-bold text-gray-700">Stock Actual:</span>
                    <div className="flex items-center gap-1.5">
                      <span className={clsx("text-lg font-bold", isLowStock ? "text-red-600" : "text-green-600")}>
                        {producto.stock_actual}
                      </span>
                      <span className="text-xs font-medium text-gray-500 lowercase">{producto.unidad_medida}</span>
                    </div>
                  </div>

                  {/* Estado de Alerta */}
                  <div className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border", 
                    isLowStock ? "bg-red-100 text-red-700 border-red-200" : "bg-green-100 text-green-700 border-green-200"
                  )}>
                    {isLowStock ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    <span>{isLowStock ? "Stock Bajo - ¡Resurtir!" : "Stock Suficiente"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Estado vacío
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">Inventario Vacío</h3>
          <p className="mt-1 text-sm text-gray-500">No hay productos registrados en la base de datos.</p>
        </div>
      )}

      {/* Botón Flotante */}
      <Link 
        href="/inventario/nuevo"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 z-40 group"
        aria-label="Nuevo Producto"
        title="Nuevo Producto"
      >
        <Plus size={28} className="group-hover:scale-110 transition-transform duration-200" />
      </Link>
    </div>
  );
}
