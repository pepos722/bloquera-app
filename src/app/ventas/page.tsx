import React from "react";
import Link from "next/link";
import { Plus, ShoppingCart, Receipt, Calendar } from "lucide-react";
import { supabase } from "@/utils/supabase";
import clsx from "clsx";

export const dynamic = 'force-dynamic';

export default async function VentasPage() {
  // Traer las ventas de Supabase, uniendo datos de cliente y obra
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select(`
      *,
      clientes ( nombre ),
      obras ( titulo )
    `)
    .order('fecha_venta', { ascending: false });

  if (error) {
    console.error("Error cargando ventas:", error);
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Ventas y Fiados</h1>
          <p className="mt-1 text-sm text-gray-500">
            Historial de salidas de material, tanto al contado como a crédito.
          </p>
        </div>
      </div>

      {/* Lista de Ventas */}
      {ventas && ventas.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {ventas.map((venta: any) => (
              <li key={venta.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-3">
                    <div className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1",
                      venta.tipo_venta === 'fiado' ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                    )}>
                      <Receipt size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">
                        {venta.clientes?.nombre || "Cliente Eliminado"}
                      </h4>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                        {venta.descripcion_material}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(venta.fecha_venta)}
                        </div>
                        {venta.obras && (
                          <div className="hidden sm:block px-2 py-0.5 bg-gray-100 rounded text-gray-600 truncate max-w-[200px]">
                            Obra: {venta.obras.titulo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(venta.total)}
                    </span>
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide mt-1",
                      venta.tipo_venta === 'fiado' ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                    )}>
                      {venta.tipo_venta}
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
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">No hay ventas registradas</h3>
          <p className="mt-1 text-sm text-gray-500">Aún no has registrado salidas de material.</p>
        </div>
      )}

      {/* Botón Flotante para Nueva Venta */}
      <Link 
        href="/ventas/nueva"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 z-40 group"
        aria-label="Nueva Venta o Fiado"
        title="Nueva Venta o Fiado"
      >
        <Plus size={28} className="group-hover:scale-110 transition-transform duration-200" />
      </Link>
    </div>
  );
}
