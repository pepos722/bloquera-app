import React from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { supabase } from "@/utils/supabase";
import { ClientCard } from "@/components/ClientCard";

// Forza a que los datos se actualicen cada vez que se entra a la página
export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  // Consulta a Supabase: Traer a todos los clientes ordenados por nombre
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre');

  if (error) {
    console.error("Error cargando los clientes:", error);
  }

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Directorio de Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra tus clientes, consulta sus saldos pendientes y contáctalos.
          </p>
        </div>
      </div>

      {/* Grid de Clientes */}
      {clientes && clientes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {clientes.map((cliente: any) => (
            <ClientCard
              key={cliente.id}
              nombre={cliente.nombre}
              telefono={cliente.telefono_whatsapp}
              limiteCredito={cliente.limite_credito}
              saldoPendiente={cliente.saldo_pendiente}
              estado={cliente.estado}
            />
          ))}
        </div>
      ) : (
        // Estado vacío
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">Sin clientes registrados</h3>
          <p className="mt-1 text-sm text-gray-500">No tienes clientes todavía. Agrega uno nuevo para empezar.</p>
        </div>
      )}

      {/* Botón Flotante para Nuevo Cliente */}
      <Link 
        href="/clientes/nuevo"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 z-40 group"
        aria-label="Nuevo Cliente"
        title="Nuevo Cliente"
      >
        <Plus size={28} className="group-hover:scale-110 transition-transform duration-200" />
      </Link>
    </div>
  );
}
