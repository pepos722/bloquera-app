import React from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default function CotizacionesIndexPage() {
  return (
    <div className="space-y-6 pb-24 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Historial de Cotizaciones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Próximamente: Aquí se guardará el historial de todas tus cotizaciones generadas.
          </p>
        </div>
      </div>

      <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
        <FileText className="mx-auto h-16 w-16 text-blue-200" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Usa el Generador Exprés</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Por el momento, puedes generar presupuestos rápidos al instante, exportarlos en PDF y enviarlos por WhatsApp sin necesidad de guardarlos en la base de datos.
        </p>
        <div className="mt-6">
          <Link
            href="/cotizaciones/nueva"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={20} />
            Ir al Generador Exprés
          </Link>
        </div>
      </div>
    </div>
  );
}
