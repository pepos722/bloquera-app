"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Save, Loader2, Building2, Phone, MapPin, FileText, Percent } from "lucide-react";

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [rfc, setRfc] = useState("");
  const [iva, setIva] = useState("");

  // Cargar configuración actual
  useEffect(() => {
    async function fetchConfig() {
      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        setNombre(data.nombre_empresa || "");
        setTelefono(data.telefono_empresa || "");
        setDireccion(data.direccion_empresa || "");
        setRfc(data.rfc_empresa || "");
        setIva(data.porcentaje_iva ? data.porcentaje_iva.toString() : "16");
      }
      setLoading(false);
    }
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('configuracion')
      .update({
        nombre_empresa: nombre,
        telefono_empresa: telefono,
        direccion_empresa: direccion,
        rfc_empresa: rfc,
        porcentaje_iva: parseFloat(iva) || 0
      })
      .eq('id', 1);

    setSaving(false);
    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      alert("Configuración actualizada correctamente. Los nuevos PDFs usarán estos datos.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Cargando configuración...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 relative">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Configuración de Empresa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Estos datos se usarán automáticamente como encabezado en las notas y cotizaciones PDF.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Fila 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Oficial del Negocio *
              </label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  id="nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  placeholder="Ej. Materiales El Constructor S.A."
                />
              </div>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ej. 555 123 4567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rfc" className="block text-sm font-medium text-gray-700 mb-1">
                RFC (Opcional)
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  id="rfc"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
                  placeholder="XAXX010101000"
                />
              </div>
            </div>
          </div>

          {/* Fila 2 */}
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección Completa de la Bodega/Tienda
            </label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. Calle Principal #123, Col. Centro, CP 12345"
              />
            </div>
          </div>

          {/* Fila 3: Impuestos */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Impuestos</h3>
            <div className="max-w-xs">
              <label htmlFor="iva" className="block text-sm font-medium text-gray-700 mb-1">
                Porcentaje de IVA por Defecto (%)
              </label>
              <div className="relative">
                <Percent size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  id="iva"
                  min="0"
                  step="0.1"
                  value={iva}
                  onChange={(e) => setIva(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="16"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Escribe 0 si tus precios ya incluyen IVA o si no cobras impuestos.
              </p>
            </div>
          </div>

        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
