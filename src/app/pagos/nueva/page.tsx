"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Save, ArrowLeft, Loader2, Wallet, User, Banknote } from "lucide-react";

export default function NuevoPagoPage() {
  const router = useRouter();
  
  // Datos traídos de Supabase
  const [clientes, setClientes] = useState<any[]>([]);
  
  // Estados del formulario
  const [clienteId, setClienteId] = useState("");
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "tarjeta">("efectivo");
  
  // Estados de la interfaz
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. Cargar clientes (preferiblemente los que tienen deuda) al entrar
  useEffect(() => {
    async function fetchClientes() {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre, saldo_pendiente, telefono_whatsapp")
        .gt("saldo_pendiente", 0) // Solo traer clientes con deuda pendiente
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

  const clienteSeleccionado = clientes.find(c => c.id === clienteId);

  // Formateador de moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  // 3. Manejar el guardado del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !monto) return;
    
    const montoTotal = parseFloat(monto);
    if (isNaN(montoTotal) || montoTotal <= 0) {
      alert("Por favor, ingresa un monto válido mayor a 0.");
      return;
    }

    if (!clienteSeleccionado) return;
    
    if (montoTotal > parseFloat(clienteSeleccionado.saldo_pendiente)) {
      const confirmar = confirm(`El monto a abonar (${formatCurrency(montoTotal)}) es mayor a la deuda actual (${formatCurrency(clienteSeleccionado.saldo_pendiente)}). ¿Deseas continuar? El cliente quedará con saldo a favor.`);
      if (!confirmar) return;
    }

    setLoading(true);
    
    // Paso A: Guardar el registro del pago
    const { error: pagoError } = await supabase.from("pagos").insert([
      { 
        cliente_id: clienteId,
        monto: montoTotal,
        metodo_pago: metodoPago
      }
    ]);

    if (pagoError) {
      alert("Error al registrar el pago: " + pagoError.message);
      setLoading(false);
      return;
    }

    // Paso B: Restarle la deuda al cliente
    const nuevoSaldo = parseFloat(clienteSeleccionado.saldo_pendiente) - montoTotal;
    
    const { error: clienteError } = await supabase
      .from("clientes")
      .update({ saldo_pendiente: nuevoSaldo })
      .eq("id", clienteId);
      
    if (clienteError) {
      console.error("Error restando saldo al cliente:", clienteError);
      alert("El pago se guardó, pero hubo un error al actualizar el saldo del cliente.");
    }

    // Preguntar si quiere enviar recibo por WhatsApp
    const mandarRecibo = confirm("¡Pago registrado con éxito! ¿Deseas enviarle su recibo de confirmación por WhatsApp?");
    
    if (mandarRecibo && clienteSeleccionado.telefono_whatsapp) {
      let texto = `✅ *Recibo de Abono*\nHola ${clienteSeleccionado.nombre}, confirmamos la recepción de tu pago.\n\n`;
      texto += `*Monto abonado:* ${formatCurrency(montoTotal)}\n`;
      texto += `*Método:* ${metodoPago.toUpperCase()}\n`;
      texto += `*Tu nuevo saldo es:* ${formatCurrency(nuevoSaldo > 0 ? nuevoSaldo : 0)}\n\n`;
      texto += `¡Muchas gracias por tu preferencia!`;

      const telefonoLimpio = clienteSeleccionado.telefono_whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(texto)}`, '_blank');
    }

    // Si todo salió bien
    router.refresh();
    router.push("/pagos");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <Link 
          href="/pagos" 
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Regresar"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Registrar Abono</h1>
          <p className="mt-1 text-sm text-gray-500">
            Recibe pagos de clientes para reducir su saldo pendiente.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        
        {/* Selector de Cliente */}
        <div>
          <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <User size={16} /> Cliente que realiza el pago *
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
              <option>Buscando clientes con adeudos...</option>
            ) : clientes.length > 0 ? (
              clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Debe: {formatCurrency(c.saldo_pendiente)})
                </option>
              ))
            ) : (
              <option value="">No hay clientes con saldo pendiente</option>
            )}
          </select>
          {clientes.length === 0 && !fetching && (
            <p className="mt-2 text-sm text-emerald-600 font-medium">
              ¡Excelente! Ningún cliente te debe dinero en este momento.
            </p>
          )}
        </div>

        {clienteSeleccionado && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-600">Deuda actual del cliente:</span>
            <span className="text-lg font-bold text-red-600">{formatCurrency(clienteSeleccionado.saldo_pendiente)}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Monto del Abono */}
          <div>
            <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
              Monto del Abono (MXN) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-medium">
                $
              </div>
              <input
                type="number"
                id="monto"
                required
                min="1"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-semibold text-emerald-600"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Banknote size={18} />
              </div>
              <select
                required
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensaje Informativo */}
        {monto && clienteSeleccionado && parseFloat(monto) > 0 && (
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start gap-3 border border-blue-200">
            <Wallet className="shrink-0 mt-0.5" size={18} />
            <p>
              El saldo de <strong>{clienteSeleccionado.nombre}</strong> pasará a ser de{" "}
              <strong>
                {formatCurrency(Math.max(0, parseFloat(clienteSeleccionado.saldo_pendiente) - parseFloat(monto)))}
              </strong>.
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/pagos"
            className="flex-1 px-4 py-3 sm:py-2 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || clientes.length === 0 || !monto}
            className="flex-1 px-4 py-3 sm:py-2 flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg font-medium transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Save size={20} />
                Confirmar Abono
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
