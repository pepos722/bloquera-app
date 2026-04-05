"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Save, ArrowLeft, Loader2, Tag, FileText, Banknote } from "lucide-react";

export default function NuevaVentaPage() {
  const router = useRouter();
  
  // Datos traídos de Supabase
  const [clientes, setClientes] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  
  // Estados del formulario
  const [clienteId, setClienteId] = useState("");
  const [obraId, setObraId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [total, setTotal] = useState("");
  const [tipoVenta, setTipoVenta] = useState<"contado" | "fiado">("contado");
  
  // Estados de la interfaz
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingObras, setFetchingObras] = useState(false);

  // 1. Cargar clientes al entrar
  useEffect(() => {
    async function fetchClientes() {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, saldo_pendiente, limite_credito")
        .order("nombre");
        
      if (!error && data) {
        setClientes(data);
        if (data.length > 0) {
          setClienteId(data[0].id);
        }
      }
      setFetching(false);
    }
    fetchClientes();
  }, []);

  // 2. Cargar obras cada que cambia el cliente seleccionado
  useEffect(() => {
    async function fetchObras() {
      if (!clienteId) return;
      setFetchingObras(true);
      setObraId(""); // Limpiar la obra seleccionada anterior

      const { data, error } = await supabase
        .from("obras")
        .select("id, titulo")
        .eq("cliente_id", clienteId)
        .order("titulo");

      if (!error && data) {
        setObras(data);
      }
      setFetchingObras(false);
    }
    
    fetchObras();
  }, [clienteId]);

  // 3. Manejar el guardado del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !descripcion || !total) return;
    
    const montoTotal = parseFloat(total);
    if (isNaN(montoTotal) || montoTotal <= 0) {
      alert("Por favor, ingresa un monto total válido.");
      return;
    }

    setLoading(true);
    
    // Paso A: Guardar el registro de la venta
    const { error: ventaError } = await supabase.from("ventas").insert([
      { 
        cliente_id: clienteId,
        obra_id: obraId || null, // null si no seleccionó ninguna
        descripcion_material: descripcion,
        total: montoTotal,
        tipo_venta: tipoVenta
      }
    ]);

    if (ventaError) {
      alert("Error al registrar la venta: " + ventaError.message);
      setLoading(false);
      return;
    }

    // Paso B: Si fue "fiado", necesitamos sumarle esa deuda al cliente
    if (tipoVenta === "fiado") {
      const clienteSeleccionado = clientes.find(c => c.id === clienteId);
      if (clienteSeleccionado) {
        const nuevoSaldo = parseFloat(clienteSeleccionado.saldo_pendiente) + montoTotal;
        
        // Actualizamos al cliente en Supabase
        const { error: clienteError } = await supabase
          .from("clientes")
          .update({ saldo_pendiente: nuevoSaldo })
          .eq("id", clienteId);
          
        if (clienteError) {
          console.error("Error sumando saldo al cliente:", clienteError);
          alert("La venta se guardó, pero hubo un error al actualizar el saldo del cliente.");
        }
      }
    }

    // Si todo salió bien
    router.refresh();
    router.push("/ventas");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link 
          href="/ventas" 
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Regresar"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Registrar Venta / Salida</h1>
          <p className="mt-1 text-sm text-gray-500">
            Anota el material que se llevó el cliente (contado o fiado).
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* Selector de Cliente */}
        <div>
          <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
            Cliente *
          </label>
          <select
            id="cliente"
            required
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            disabled={fetching || clientes.length === 0}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
          >
            {fetching ? (
              <option>Cargando clientes...</option>
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
        </div>

        {/* Selector de Obra (Opcional) */}
        <div>
          <label htmlFor="obra" className="block text-sm font-medium text-gray-700 mb-1">
            Obra de destino (Opcional)
          </label>
          <select
            id="obra"
            value={obraId}
            onChange={(e) => setObraId(e.target.value)}
            disabled={fetchingObras || obras.length === 0 || !clienteId}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-50"
          >
            <option value="">-- Sin asignar a obra específica --</option>
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.titulo}
              </option>
            ))}
          </select>
          {fetchingObras && <p className="text-xs text-gray-500 mt-1">Buscando obras del cliente...</p>}
        </div>

        {/* Descripción del Material */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Materiales / Concepto *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none text-gray-400">
              <FileText size={18} />
            </div>
            <textarea
              id="descripcion"
              required
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ej. 10 bultos de Cemento, 2 varillas..."
            />
          </div>
        </div>

        {/* Monto Total y Tipo de Venta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Monto Total */}
          <div>
            <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-1">
              Total de la nota (MXN) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-medium">
                $
              </div>
              <input
                type="number"
                id="total"
                required
                min="1"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Tipo de Venta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Venta *
            </label>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTipoVenta("contado")}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  tipoVenta === "contado" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Banknote size={16} /> Contado
              </button>
              <button
                type="button"
                onClick={() => setTipoVenta("fiado")}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  tipoVenta === "fiado" ? "bg-white text-amber-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Tag size={16} /> Fiado (Crédito)
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje de advertencia si es fiado */}
        {tipoVenta === "fiado" && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm flex items-start gap-3 border border-amber-200">
            <Tag className="shrink-0 mt-0.5" size={18} />
            <p>
              <strong>Atención:</strong> Al guardar, este monto se sumará automáticamente a la deuda pendiente del cliente seleccionado.
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/ventas"
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
                Procesando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Venta
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
