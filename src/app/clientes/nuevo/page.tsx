"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Save, ArrowLeft, Loader2, Phone } from "lucide-react";

export default function NuevoClientePage() {
  const router = useRouter();
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [limiteCredito, setLimiteCredito] = useState("");
  
  // Estados de la interfaz
  const [loading, setLoading] = useState(false);

  // Función para guardar el cliente en Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !telefono) return;
    
    setLoading(true);
    
    // Convertir el string de limite de crédito a un número, por defecto 0 si está vacío
    const limiteNumerico = limiteCredito ? parseFloat(limiteCredito) : 0;
    
    const { error } = await supabase.from("clientes").insert([
      { 
        nombre: nombre, 
        telefono_whatsapp: telefono,
        limite_credito: limiteNumerico,
        saldo_pendiente: 0,
        estado: 'al_corriente'
      }
    ]);

    if (error) {
      alert("Error al registrar cliente: " + error.message);
      setLoading(false);
    } else {
      // Recargar y regresar a la lista de clientes
      router.refresh();
      router.push("/clientes");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link 
          href="/clientes" 
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Regresar"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Nuevo Cliente</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registra a un cliente para asignarle obras o fiarle material.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* Campo: Nombre del Cliente */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo / Razón Social
          </label>
          <input
            type="text"
            id="nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej. Ing. Carlos Mendoza"
          />
        </div>

        {/* Campo: Teléfono / WhatsApp */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono (WhatsApp)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              id="telefono"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej. +52 1 123 456 7890"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Es indispensable para mandarle notificaciones de cobranza automáticas.
          </p>
        </div>

        {/* Campo: Límite de Crédito */}
        <div>
          <label htmlFor="limiteCredito" className="block text-sm font-medium text-gray-700 mb-1">
            Límite de Crédito Autorizado (MXN)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-medium">
              $
            </div>
            <input
              type="number"
              id="limiteCredito"
              min="0"
              step="0.01"
              value={limiteCredito}
              onChange={(e) => setLimiteCredito(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej. 5000"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Deja en 0 o en blanco si este cliente no tiene autorización para llevarse material fiado.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/clientes"
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
                Registrando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
