"use client";

import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Calculator, Download, Phone, Plus, Trash2, Send, Search, Box } from "lucide-react";
import { supabase } from "@/utils/supabase";

interface ItemCotizacion {
  id: string;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
}

export default function GeneradorCotizacionesPage() {
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [items, setItems] = useState<ItemCotizacion[]>([]);
  
  // Inventario
  const [inventario, setInventario] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Campos para nuevo item
  const [nuevoConcepto, setNuevoConcepto] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState<number | "">("");
  const [nuevoPrecio, setNuevoPrecio] = useState<number | "">("");

  // Configuración de Empresa
  const [empresa, setEmpresa] = useState<any>({ nombre_empresa: "Mi Ferretería", porcentaje_iva: 16 });

  // Cargar inventario y configuración desde Supabase
  useEffect(() => {
    async function fetchData() {
      // 1. Inventario
      const { data: invData } = await supabase.from("inventario").select("*").order("nombre");
      if (invData) setInventario(invData);
      
      // 2. Configuración Global
      const { data: confData } = await supabase.from("configuracion").select("*").eq('id', 1).single();
      if (confData) setEmpresa(confData);
    }
    fetchData();

    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar inventario por búsqueda
  const filteredInventario = inventario.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Al seleccionar un producto del buscador
  const handleSelectProduct = (producto: any) => {
    setSearchTerm(producto.nombre);
    setNuevoConcepto(producto.nombre);
    setNuevoPrecio(producto.precio_unitario);
    setShowDropdown(false);
    
    // Enfocar el input de cantidad (opcional pero buena UX)
    document.getElementById("cantidadInput")?.focus();
  };

  // Totales
  const subtotal = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  const porcentajeIva = empresa.porcentaje_iva ? Number(empresa.porcentaje_iva) : 0;
  const iva = subtotal * (porcentajeIva / 100);
  const total = subtotal + iva;

  // Formateador de moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  const agregarItem = () => {
    if (!nuevoConcepto || !nuevaCantidad || !nuevoPrecio) return;
    
    const item: ItemCotizacion = {
      id: Math.random().toString(36).substring(7),
      concepto: nuevoConcepto,
      cantidad: Number(nuevaCantidad),
      precioUnitario: Number(nuevoPrecio)
    };
    
    setItems([...items, item]);
    setNuevoConcepto("");
    setSearchTerm("");
    setNuevaCantidad("");
    setNuevoPrecio("");
  };

  const eliminarItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

    // Función para generar PDF
  const generarPDF = () => {
    if (!clienteNombre || items.length === 0) {
      alert("Por favor ingresa el nombre del cliente y al menos un artículo.");
      return;
    }

    const doc = new jsPDF();
    
    // Configuración Base de PDF
    const azul = [37, 99, 235] as [number, number, number];
    const grisOscuro = [75, 85, 99] as [number, number, number];
    
    // --- ENCABEZADO CORPORATIVO ---
    doc.setFontSize(22);
    doc.setTextColor(...azul);
    doc.setFont("helvetica", "bold");
    doc.text("COTIZACIÓN", 14, 20);
    
    // Nombre de la Empresa (Dinámico)
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(empresa.nombre_empresa || "Mi Ferretería", 14, 30);
    
    // Datos de la Empresa (Dinámicos)
    doc.setFontSize(9);
    doc.setTextColor(...grisOscuro);
    doc.setFont("helvetica", "normal");
    let yOffset = 36;
    if (empresa.rfc_empresa) { doc.text(`RFC: ${empresa.rfc_empresa}`, 14, yOffset); yOffset += 5; }
    if (empresa.telefono_empresa) { doc.text(`Tel: ${empresa.telefono_empresa}`, 14, yOffset); yOffset += 5; }
    if (empresa.direccion_empresa) { doc.text(empresa.direccion_empresa, 14, yOffset); }
    
    // --- DATOS DEL CLIENTE ---
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Preparado para:", 120, 20);
    doc.setFont("helvetica", "normal");
    doc.text(clienteNombre, 120, 26);
    if (clienteTelefono) { doc.text(`Tel: ${clienteTelefono}`, 120, 31); }
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`, 120, 36);

    // --- TABLA DE ARTÍCULOS ---
    const tableData = items.map(item => [
      item.cantidad.toString(),
      item.concepto,
      formatCurrency(item.precioUnitario),
      formatCurrency(item.cantidad * item.precioUnitario)
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Cant.', 'Descripción', 'P. Unitario', 'Importe']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: azul, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 }
      }
    });

    // --- TOTALES ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text("Subtotal:", 140, finalY);
    doc.text(formatCurrency(subtotal), 195, finalY, { align: "right" });
    
    if (porcentajeIva > 0) {
      doc.text(`IVA (${porcentajeIva}%):`, 140, finalY + 6);
      doc.text(formatCurrency(iva), 195, finalY + 6, { align: "right" });
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...azul);
    const totalY = porcentajeIva > 0 ? finalY + 14 : finalY + 8;
    doc.text("TOTAL:", 140, totalY);
    doc.text(formatCurrency(total), 195, totalY, { align: "right" });

    // Mensaje de Agradecimiento
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150);
    doc.text("¡Gracias por su preferencia! Esta cotización tiene una vigencia de 15 días.", 14, totalY + 20);

    // Guardar
    doc.save(`Cotizacion_${clienteNombre.replace(/\s+/g, '_')}.pdf`);
  };

  // Función para enviar por WhatsApp
  const enviarWhatsApp = () => {
    if (!clienteNombre || items.length === 0) {
      alert("Por favor ingresa el nombre del cliente y al menos un artículo.");
      return;
    }

    let texto = `*Cotización de Materiales*\nHola ${clienteNombre}, te comparto tu cotización:\n\n`;
    
    items.forEach(i => {
      texto += `• ${i.cantidad}x ${i.concepto}: ${formatCurrency(i.cantidad * i.precioUnitario)}\n`;
    });
    
    texto += `\n*Subtotal:* ${formatCurrency(subtotal)}`;
    texto += `\n*IVA:* ${formatCurrency(iva)}`;
    texto += `\n*TOTAL: ${formatCurrency(total)}*\n\n`;
    texto += `Quedo a tus órdenes.`;

    const telefonoLimpio = clienteTelefono.replace(/\D/g, "");
    
    if (telefonoLimpio) {
      window.open(`https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(texto)}`, '_blank');
    } else {
      // Si no hay teléfono, solo abre WA web para que elija a quién enviarlo
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center gap-2">
            Generador de Cotizaciones
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Busca en tu inventario, arma el presupuesto, expórtalo a PDF y envíalo por WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Izquierdo: Formulario de Ingreso */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Datos del Cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Datos del Cliente</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Ej. Arq. Miguel Ángel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (Opcional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="tel"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="10 dígitos"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* Buscador y Agregar Material */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Agregar Material</h3>
            
            {/* Buscador de Inventario */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-medium text-gray-700 mb-1">Buscar en Inventario</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setNuevoConcepto(e.target.value); // Permite texto libre si no existe en BD
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Ej. Cemento Cruz Azul..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm transition-all"
                  autoComplete="off"
                />
              </div>

              {/* Menú Desplegable de Resultados */}
              {showDropdown && inventario.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredInventario.length > 0 ? (
                    <ul className="py-1">
                      {filteredInventario.map(p => (
                        <li 
                          key={p.id} 
                          onClick={() => handleSelectProduct(p)}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between group"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{p.nombre}</div>
                            <div className="text-xs text-gray-500 flex gap-2">
                              <span>Código: {p.codigo || 'N/A'}</span>
                              <span className="text-blue-600 font-semibold">{formatCurrency(p.precio_unitario)}</span>
                            </div>
                          </div>
                          <Box size={16} className="text-gray-300 group-hover:text-blue-500" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-3 py-3 text-sm text-gray-500 text-center">
                      No se encontraron materiales. Puedes escribirlo manualmente.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Cantidad y Precio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  id="cantidadInput"
                  type="number"
                  min="1"
                  value={nuevaCantidad}
                  onChange={(e) => setNuevaCantidad(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit. ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={agregarItem}
              disabled={!nuevoConcepto || !nuevaCantidad || !nuevoPrecio}
              className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={16} /> Agregar a la lista
            </button>
          </div>
        </div>

        {/* Lado Derecho: Vista Previa y Acciones */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Vista Previa</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded">No guardado en BD</span>
          </div>

          <div className="p-5 flex-1 overflow-x-auto">
            {items.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2">Cant.</th>
                    <th className="px-3 py-2">Descripción</th>
                    <th className="px-3 py-2 text-right">P. Unitario</th>
                    <th className="px-3 py-2 text-right">Importe</th>
                    <th className="px-3 py-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-900">{item.cantidad}</td>
                      <td className="px-3 py-3">{item.concepto}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(item.precioUnitario)}</td>
                      <td className="px-3 py-3 text-right font-medium">{formatCurrency(item.cantidad * item.precioUnitario)}</td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => eliminarItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                <Calculator size={40} className="mb-3 opacity-20" />
                <p>Agrega materiales para ver la cotización.</p>
              </div>
            )}
          </div>

          {/* Resumen de Totales */}
          <div className="bg-gray-50 p-5 border-t border-gray-200">
            <div className="w-full sm:w-1/2 ml-auto space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IVA (16%):</span>
                <span>{formatCurrency(iva)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Botones de Exportación */}
          <div className="p-5 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={generarPDF}
              disabled={items.length === 0 || !clienteNombre}
              className="py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Download size={18} />
              Descargar PDF
            </button>
            <button
              onClick={enviarWhatsApp}
              disabled={items.length === 0 || !clienteNombre}
              className="py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Send size={18} />
              Enviar por WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
