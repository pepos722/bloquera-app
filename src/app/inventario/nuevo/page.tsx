"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Save, ArrowLeft, Loader2, Package, Tag, Hash, Cuboid } from "lucide-react";

export default function NuevoProductoPage() {
  const router = useRouter();
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [stock, setStock] = useState("");
  const [unidad, setUnidad] = useState("pieza");
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !precioUnitario || !stock) return;
    
    setLoading(true);
    
    const { error } = await supabase.from("inventario").insert([
      { 
        nombre, 
        codigo: codigo || null, // Opcional
        precio_unitario: parseFloat(precioUnitario),
        stock_actual: parseInt(stock, 10),
        unidad_medida: unidad
      }
    ]);

    if (error) {
      alert("Error al registrar producto: " + error.message);
      setLoading(false);
    } else {
      router.refresh();
      router.push("/inventario");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/inventario" 
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Regresar"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Nuevo Producto</h1>
          <p className="mt-1 text-sm text-gray-500">
            Da de alta material en la bodega para que esté disponible en ventas y cotizaciones.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* Fila 1: Nombre y Código */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Producto / Descripción *
            </label>
            <div className="relative">
              <Package size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                id="nombre"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ej. Cemento Cruz Azul 50kg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
              Código de Barras/SKU (Opcional)
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                placeholder="Ej. CEM-CA-50"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="unidad" className="block text-sm font-medium text-gray-700 mb-1">
              Unidad de Medida *
            </label>
            <div className="relative">
              <Cuboid size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <select
                id="unidad"
                required
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="pieza">Pieza (pza)</option>
                <option value="bulto">Bulto</option>
                <option value="m3">Metro Cúbico (m³)</option>
                <option value="tramo">Tramo (Varilla/Tubo)</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="tonelada">Tonelada (Ton)</option>
                <option value="caja">Caja</option>
                <option value="viaje">Viaje/Flete</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fila 2: Precio y Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
              Precio Unitario de Venta (MXN) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-medium">$</span>
              <input
                type="number"
                id="precio"
                required
                min="0"
                step="0.01"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Inicial en Bodega *
            </label>
            <div className="relative">
              <Tag size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="number"
                id="stock"
                required
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-blue-700"
                placeholder="Ej. 100"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/inventario"
            className="flex-1 px-4 py-3 sm:py-2 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 sm:py-2 flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg font-medium transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Producto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
