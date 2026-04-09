import React from "react";
import Link from "next/link";
import { ProjectCard, ProjectStatus } from "@/components/ProjectCard";
import { Plus, FolderOpen, TrendingUp, AlertCircle, HardHat, Wallet } from "lucide-react";
import { supabase } from "@/utils/supabase";

// Forzar datos frescos
export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 0. Verificar Sesión y Rol del Usuario
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  
  if (user) {
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single();
      
    if (!perfilError && perfil) {
      isAdmin = perfil.rol === 'admin';
    } else if (perfilError && perfilError.code === '42P01') {
      // Si la tabla 'perfiles' aún no existe en Supabase, asumimos admin por defecto para no romper la app
      isAdmin = true;
    }
  }

  // 1. Obtener Obras Activas
  const { data: obras, error: obrasError } = await supabase
    .from('obras')
    .select(`id, titulo, progreso, estado, clientes ( nombre )`)
    .order('creado_en', { ascending: false });

  // 2. Obtener total de deuda (Cuentas por cobrar) sumando saldos de clientes
  const { data: clientesDeuda } = await supabase
    .from('clientes')
    .select('saldo_pendiente')
    .gt('saldo_pendiente', 0);
  
  const totalCuentasPorCobrar = clientesDeuda?.reduce((sum, cliente) => sum + Number(cliente.saldo_pendiente), 0) || 0;

  // 3. Obtener Ventas Totales
  const { data: ventasTotales } = await supabase
    .from('ventas')
    .select('total');
    
  const totalVendido = ventasTotales?.reduce((sum, venta) => sum + Number(venta.total), 0) || 0;

  const obrasActivas = obras?.filter(o => o.estado === 'activo').length || 0;

  // Formateador
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-8 pb-24 relative">
      {/* Encabezado del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {isAdmin ? "Panel de Control Directivo" : "Punto de Venta Activo"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? "Resumen financiero y estado de obras al día de hoy." : "Bienvenido. Desde aquí puedes registrar nuevas ventas y ver obras activas."}
          </p>
        </div>
      </div>

      {/* Tarjetas de Métricas (Dashboard Financiero) - SOLO ADMIN */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Métrica 1: Ventas Totales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ventas Históricas</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalVendido)}</p>
            </div>
          </div>

          {/* Métrica 2: Cuentas por Cobrar */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 flex items-center gap-1">
                Cuentas por Cobrar <AlertCircle size={14} />
              </p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCuentasPorCobrar)}</p>
            </div>
          </div>

          {/* Métrica 3: Obras Activas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <HardHat size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Obras Activas</p>
              <p className="text-2xl font-bold text-gray-900">{obrasActivas} <span className="text-sm font-normal text-gray-500">proyectos</span></p>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-blue-800 flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-full shrink-0">
            <HardHat size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Modo Vendedor</h2>
            <p className="text-sm mt-1">
              Tu cuenta tiene permisos de vendedor. Tienes acceso al punto de venta, inventario, clientes y cotizaciones. 
              Por motivos de privacidad, la información financiera general (ventas totales y cuentas por cobrar) está oculta.
            </p>
          </div>
        </div>
      )}

      {/* Separador visual */}
      <div className="pt-4 border-t border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Obras Recientes</h2>
        
        {/* Grid de Proyectos */}
        {obras && obras.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {obras.map((obra: any) => (
              <ProjectCard
                key={obra.id}
                title={obra.titulo}
                client={obra.clientes?.nombre || "Cliente Desconocido"}
                progress={obra.progreso}
                status={obra.estado as ProjectStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-semibold text-gray-900">No hay obras registradas</h3>
            <p className="mt-1 text-sm text-gray-500">Empieza creando un nuevo proyecto.</p>
          </div>
        )}
      </div>

      {/* Botón Flotante */}
      <Link 
        href="/obras/nueva"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 z-40 group"
        aria-label="Nueva Obra"
        title="Nueva Obra"
      >
        <Plus size={28} className="group-hover:scale-110 transition-transform duration-200" />
      </Link>
    </div>
  );
}
