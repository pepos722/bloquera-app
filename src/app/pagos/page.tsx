import React from "react";
import Link from "next/link";
import { Plus, CreditCard, Calendar, CheckCircle2, ArrowDownToLine } from "lucide-react";
import { supabase } from "@/utils/supabase";
import clsx from "clsx";

export const dynamic = 'force-dynamic';

export default async function PagosPage() {
  // Traer los pagos de Supabase, uniendo datos del cliente
  const { data: pagos, error } = await supabase
    .from('pagos')
    .select(`
      *,
      clientes ( nombre )
    `)
    .order('fecha_pago', { ascending: false });

  if (error) {
    console.error("Error cargando pagos:", error);
  }

  // Formatear moneda y fecha
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString("es-MX", options);
  };

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Pagos y Abonos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Historial de abonos recibidos por clientes con saldo pendiente.
          </p>
        </div>
      </div>

      {/* Lista de Pagos */}
      {pagos && pagos.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {pagos.map((pago: any) => (
              <li key={pago.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                      <ArrowDownToLine size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        {pago.clientes?.nombre || "Cliente Eliminado"}
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
                          {pago.metodo_pago}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        Abono recibido correctamente
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-400">
                        <Calendar size={14} />
                        {formatDate(pago.fecha_pago)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <span className="text-xl font-bold text-emerald-600">
                      +{formatCurrency(pago.monto)}
                    </span>
                  </div>

                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        // Estado vacío
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No hay pagos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">Registra el primer abono cuando un cliente venga a pagar.</p>
        </div>
      )}

      {/* Botón Flotante para Nuevo Pago */}
      <Link 
        href="/pagos/nueva"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 z-40 group"
        aria-label="Registrar Abono"
        title="Registrar Abono"
      >
        <Plus size={28} className="group-hover:scale-110 transition-transform duration-200" />
      </Link>
    </div>
  );
}
