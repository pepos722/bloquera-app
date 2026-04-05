"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

export default function NuevaObraPage() {
  const router = useRouter();
  
  // Estados del formulario
  const [clientes, setClientes] = useState<any[]>([]);
  const [titulo, setTitulo] = useState("");
  const [clienteId, setClienteId] = useState("");
  
  // Estados de la interfaz
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Cargar los clientes desde Supabase al entrar a la página
  useEffect(() => {
    async function fetchClientes() {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre")
        .order("nombre");
        
      if (error) {
        console.error("Error al cargar clientes:", error);
      } else if (data) {
        setClientes(data);
        if (data.length > 0) {
          setClienteId(data[0].id); // Seleccionar el primer cliente por defecto
        }
      }
      setFetching(false);
    }
    
    fetchClientes();
  }, []);

  // Función para guardar la nueva obra en Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !clienteId) return;
    
    setLoading(true);
    
    const { error } = await supabase.from("obras").insert([
      { titulo: titulo, cliente_id: clienteId }
    ]);

    if (error) {
      alert("Error al crear la obra: " + error.message);
      setLoading(false);
    } else {
      // Si todo sale bien, recargamos y mandamos al usuario de vuelta al inicio
      router.refresh();
      router.push("/");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado con botón de regreso */}
      <div className="flex items-center gap-4">
        <Link 
          href="/" 
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Regresar"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Nueva Obra</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registra un nuevo proyecto y asígnalo a un cliente existente.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* Campo: Nombre de la Obra */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Proyecto / Obra
          </label>
          <input
            type="text"
            id="titulo"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Ej. Construcción Barda Lote 45"
          />
        </div>

        {/* Campo: Selector de Cliente */}
        <div>
          <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
            Cliente Asignado
          </label>
          <select
            id="cliente"
            required
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            disabled={fetching || clientes.length === 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
          >
            {fetching ? (
              <option>Cargando clientes de la base de datos...</option>
            ) : clientes.length > 0 ? (
              clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))
            ) : (
              <option value="">No hay clientes registrados</option>
            )}
          </select>
          
          {/* Mensaje de ayuda si no hay clientes */}
          {clientes.length === 0 && !fetching && (
            <p className="mt-2 text-sm text-amber-600">
              Debes registrar al menos un cliente en la sección "Clientes" para poder crear una obra.
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 px-4 py-3 sm:py-2 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || clientes.length === 0}
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
                Crear Obra
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
