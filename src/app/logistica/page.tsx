"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Truck, CheckCircle2, Clock, MapPin, Package, RefreshCw } from "lucide-react";
import clsx from "clsx";

export default function LogisticaPage() {
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Cargar las entregas
  const fetchEntregas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('entregas')
      .select(`
        *,
        ventas ( descripcion_material, total ),
        clientes ( nombre, telefono_whatsapp )
      `)
      .order('creado_en', { ascending: false });

    if (!error && data) {
      setEntregas(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntregas();
  }, []);

  // Cambiar estado del viaje
  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    setUpdatingId(id);
    
    const updateData: any = { estado: nuevoEstado };
    if (nuevoEstado === 'entregado') {
      updateData.entregado_en = new Date().toISOString();
    }

    const { error } = await supabase
      .from('entregas')
      .update(updateData)
      .eq('id', id);

    if (!error) {
      // Actualizar UI localmente rápido
      setEntregas(prev => prev.map(e => e.id === id ? { ...e, ...updateData } : e));
    } else {
      alert("Error al actualizar el estado: " + error.message);
    }
    setUpdatingId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' });
  };

  // Separar por columnas lógicas (Kanban)
  const pendientes = entregas.filter(e => e.estado === 'pendiente');
  const enCamino = entregas.filter(e => e.estado === 'en_camino');
  const entregados = entregas.filter(e => e.estado === 'entregado');

  // Tarjeta reutilizable para cada entrega
  const EntregaCard = ({ entrega }: { entrega: any }) => (
    <div className={clsx(
      "bg-white rounded-xl shadow-sm border p-4 sm:p-5 flex flex-col gap-3 transition-all",
      entrega.estado === 'pendiente' ? "border-gray-200" :
      entrega.estado === 'en_camino' ? "border-blue-300 ring-1 ring-blue-100" :
      "border-green-200 opacity-75"
    )}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-900 text-lg leading-tight">
          {entrega.clientes?.nombre || "Cliente Desconocido"}
        </h3>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {formatDate(entrega.creado_en)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="leading-snug">{entrega.direccion}</p>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg">
          <Package size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="leading-snug text-xs font-medium">{entrega.ventas?.descripcion_material}</p>
        </div>
      </div>

      {/* Botones de Acción para el Chofer */}
      <div className="pt-3 border-t border-gray-100 mt-auto flex gap-2">
        {entrega.estado === 'pendiente' && (
          <button 
            onClick={() => cambiarEstado(entrega.id, 'en_camino')}
            disabled={updatingId === entrega.id}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {updatingId === entrega.id ? <RefreshCw size={18} className="animate-spin" /> : <Truck size={18} />}
            Iniciar Viaje
          </button>
        )}
        
        {entrega.estado === 'en_camino' && (
          <>
            <button 
              onClick={() => window.open(`https://wa.me/${entrega.clientes?.telefono_whatsapp?.replace(/\D/g, "")}?text=¡Hola! Tu material está en camino y llegará pronto.`, '_blank')}
              className="px-3 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-colors"
              title="Avisar por WhatsApp"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.334.101.154.453.728.966 1.151.664.549 1.228.72 1.386.806.159.087.253.072.347-.043.094-.116.405-.463.513-.622.108-.159.217-.13.361-.072l1.144.541c.159.072.26.116.296.18.036.064.036.376-.108.781z" /></svg>
            </button>
            <button 
              onClick={() => cambiarEstado(entrega.id, 'entregado')}
              disabled={updatingId === entrega.id}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            >
              {updatingId === entrega.id ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              Marcar Entregado
            </button>
          </>
        )}

        {entrega.estado === 'entregado' && (
          <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> Entregado a las {formatDate(entrega.entregado_en)}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Logística y Entregas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Panel para choferes. Monitorea y actualiza el estado de los viajes.
          </p>
        </div>
        <button 
          onClick={fetchEntregas}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all text-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualizar Rutas
        </button>
      </div>

      {/* Vista Kanban / Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Columna: PENDIENTES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-xl border border-gray-200">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <Clock size={18} /> Por Cargar
            </h2>
            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{pendientes.length}</span>
          </div>
          
          <div className="space-y-4">
            {pendientes.length > 0 ? (
              pendientes.map(e => <EntregaCard key={e.id} entrega={e} />)
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No hay viajes pendientes.</p>
            )}
          </div>
        </div>

        {/* Columna: EN CAMINO */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200">
            <h2 className="font-bold text-blue-700 flex items-center gap-2">
              <Truck size={18} /> En Camino
            </h2>
            <span className="bg-blue-200 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{enCamino.length}</span>
          </div>
          
          <div className="space-y-4">
            {enCamino.length > 0 ? (
              enCamino.map(e => <EntregaCard key={e.id} entrega={e} />)
            ) : (
              <p className="text-sm text-blue-300 text-center py-8">Ningún camión en ruta.</p>
            )}
          </div>
        </div>

        {/* Columna: ENTREGADOS (Hoy) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-200">
            <h2 className="font-bold text-green-700 flex items-center gap-2">
              <CheckCircle2 size={18} /> Entregados
            </h2>
            <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{entregados.length}</span>
          </div>
          
          <div className="space-y-4">
            {entregados.length > 0 ? (
              entregados.map(e => <EntregaCard key={e.id} entrega={e} />)
            ) : (
              <p className="text-sm text-green-300 text-center py-8">Aún no hay entregas finalizadas.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
