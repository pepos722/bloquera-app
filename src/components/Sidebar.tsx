"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HardHat, 
  Settings, 
  Menu, 
  X,
  Users,
  ShoppingCart,
  Calculator,
  FileText,
  CreditCard
} from "lucide-react";
import clsx from "clsx";

const menuItems = [
  { name: "Obras (Inicio)", icon: HardHat, href: "/" },
  { name: "Clientes", icon: Users, href: "/clientes" },
  { name: "Ventas y Fiados", icon: ShoppingCart, href: "/ventas" },
  { name: "Pagos y Abonos", icon: CreditCard, href: "/pagos" },
  { name: "Cotizaciones", icon: FileText, href: "/cotizaciones" },
  { name: "Calculadora", icon: Calculator, href: "/calculadora" },
  { name: "Configuración", icon: Settings, href: "/configuracion" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el sidebar en móvil cuando se cambia de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevenir scroll en el body cuando el menú móvil está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      {/* Botón de Hamburguesa para Móviles (Solo visible en md e inferiores) */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu size={24} />
      </button>

      {/* Overlay oscuro para móviles */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Cabecera del Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <span className="text-xl font-bold text-blue-600 truncate">
            BloqueraApp
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 font-medium",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon 
                  size={20} 
                  className={isActive ? "text-blue-600" : "text-gray-400"} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Pie del Sidebar (Opcional, e ej. perfil de usuario) */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              U
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">Usuario</span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
