import React from "react";
import clsx from "clsx";
import { User, Phone, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";

interface ClientCardProps {
  nombre: string;
  telefono: string;
  limiteCredito: number;
  saldoPendiente: number;
  estado: string;
}

export function ClientCard({
  nombre,
  telefono,
  limiteCredito,
  saldoPendiente,
  estado,
}: ClientCardProps) {
  // Formatear moneda (pesos)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Limpiar el teléfono para el link de WhatsApp (quitar espacios, guiones, etc.)
  const cleanPhone = telefono.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  // Configuración de colores según estado de la cuenta
  const isAtrasado = estado === "atrasado";
  const isBloqueado = estado === "bloqueado";
  
  const statusColor = isBloqueado 
    ? "bg-red-100 text-red-700 border-red-200" 
    : isAtrasado 
    ? "bg-amber-100 text-amber-700 border-amber-200" 
    : "bg-green-100 text-green-700 border-green-200";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Cabecera de la Tarjeta */}
      <div className="p-5 border-b border-gray-100 flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 leading-tight">
              {nombre}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <Phone size={14} />
              <span>{telefono}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información Financiera */}
      <div className="p-5 bg-gray-50/50 flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
            <Wallet size={16} /> Límite Autorizado:
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(limiteCredito)}
          </span>
        </div>

        <div className="flex justify-between items-center p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
          <span className="text-sm font-bold text-gray-700">Saldo Pendiente:</span>
          <span className={clsx("text-lg font-bold", saldoPendiente > 0 ? "text-red-600" : "text-green-600")}>
            {formatCurrency(saldoPendiente)}
          </span>
        </div>

        {/* Estado de Cuenta */}
        <div className={clsx("flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border", statusColor)}>
          {isBloqueado || isAtrasado ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>
            {estado === "al_corriente" ? "Cuenta al Corriente" : 
             estado === "atrasado" ? "Pago Atrasado" : "Cuenta Bloqueada"}
          </span>
        </div>
      </div>

      {/* Acciones Rápidas (Botón de WhatsApp) */}
      <div className="p-4 bg-white border-t border-gray-100">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da851] text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.334.101.154.453.728.966 1.151.664.549 1.228.72 1.386.806.159.087.253.072.347-.043.094-.116.405-.463.513-.622.108-.159.217-.13.361-.072l1.144.541c.159.072.26.116.296.18.036.064.036.376-.108.781z" />
          </svg>
          Mandar WhatsApp
        </a>
      </div>
    </div>
  );
}
