"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase";
import { Save, ArrowLeft, Loader2, Tag, FileText, Banknote, Search, Box, Plus, Trash2, ShoppingCart, ScanLine, Truck, Send } from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";

interface ItemVenta {
  id: string;
  inventario_id: string | null;
  concepto: string;
  cantidad: number;
  precioUnitario: number;
}

export default function NuevaVentaPage() {
  const router = useRouter();
  
  // Datos traídos de Supabase
  const [clientes, setClientes] = useState<any[]>([]);
  const [obras, setObras] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  
  // Estados del formulario general
  const [clienteId, setClienteId] = useState("");
  const [obraId, setObraId] = useState("");
  const [tipoVenta, setTipoVenta] = useState<"contado" | "fiado">("contado");
  const [requiereEnvio, setRequiereEnvio] = useState(false);
  const [direccionEnvio, setDireccionEnvio] = useState("");
  const [isVentaMostrador, setIsVentaMostrador] = useState(true);
  const [nombreMostrador, setNombreMostrador] = useState("");
  const [telefonoMostrador, setTelefonoMostrador] = useState("");
  const [enviarRecibo, setEnviarRecibo] = useState(false);
  
  // Estados del Carrito de Ventas
  const [items, setItems] = useState<ItemVenta[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Campos temporales para el nuevo item
  const [itemInventarioId, setItemInventarioId] = useState<string | null>(null);
  const [nuevoConcepto, setNuevoConcepto] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState<number | "">("");
  const [nuevoPrecio, setNuevoPrecio] = useState<number | "">("");
  
  // Estados de la interfaz
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchingObras, setFetchingObras] = useState(false);
  
  // Estados del Escáner
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  // 1. Cargar datos iniciales
  useEffect(() => {
    async function fetchData() {
      // Clientes
      const { data: dataClientes } = await supabase.from("clientes").select("id, nombre, saldo_pendiente").order("nombre");
      if (dataClientes) {
        setClientes(dataClientes);
        if (dataClientes.length > 0) setClienteId(dataClientes[0].id);
      }
      
      // Inventario
      const { data: dataInv } = await supabase.from("inventario").select("*").order("nombre");
      if (dataInv) setInventario(dataInv);
      
      setFetching(false);
    }
    fetchData();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Cargar obras cada que cambia el cliente seleccionado
  useEffect(() => {
    async function fetchObras() {
      if (!clienteId) return;
      setFetchingObras(true);
      setObraId("");

      const { data } = await supabase.from("obras").select("id, titulo").eq("cliente_id", clienteId).order("titulo");
      if (data) setObras(data);
      setFetchingObras(false);
    }
    fetchObras();
  }, [clienteId]);

  // Formateo y Cálculos
  const formatCurrency = (amount: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  const subtotal = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  const total = subtotal; // Sin IVA por defecto en punto de venta materialero, se puede agregar si es factura.

  // Manejo del buscador
  const filteredInventario = inventario.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.codigo && p.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectProduct = (producto: any) => {
    setSearchTerm(producto.nombre);
    setNuevoConcepto(producto.nombre);
    setNuevoPrecio(producto.precio_unitario);
    setItemInventarioId(producto.id);
    setShowDropdown(false);
    
    // Si viene de escanear, automáticamente la cantidad es 1 y lo agregamos al carrito
    if (isScanning) {
       setNuevaCantidad(1);
    } else {
       document.getElementById("cantidadInput")?.focus();
    }
  };

  const handleScan = (codigo: string) => {
    setIsScanning(false);
    setScanError("");

    const productoEncontrado = inventario.find(p => p.codigo && p.codigo.toLowerCase() === codigo.toLowerCase());

    if (productoEncontrado) {
      // Simular que el usuario lo seleccionó
      setSearchTerm(productoEncontrado.nombre);
      setNuevoConcepto(productoEncontrado.nombre);
      setNuevoPrecio(productoEncontrado.precio_unitario);
      setItemInventarioId(productoEncontrado.id);
      setNuevaCantidad(1);
      
      // Auto-agregar al carrito después de un breve delay para que los estados se actualicen
      setTimeout(() => {
        const item: ItemVenta = {
          id: Math.random().toString(36).substring(7),
          inventario_id: productoEncontrado.id,
          concepto: productoEncontrado.nombre,
          cantidad: 1,
          precioUnitario: Number(productoEncontrado.precio_unitario)
        };
        setItems(prev => [...prev, item]);
        setNuevoConcepto("");
        setSearchTerm("");
        setNuevaCantidad("");
        setNuevoPrecio("");
        setItemInventarioId(null);
      }, 100);

    } else {
      setScanError(`No se encontró ningún producto con el código: ${codigo}`);
    }
  };

  const agregarItem = () => {
    if (!nuevoConcepto || !nuevaCantidad || !nuevoPrecio) return;
    
    const item: ItemVenta = {
      id: Math.random().toString(36).substring(7),
      inventario_id: itemInventarioId, // Si es texto libre, esto será null
      concepto: nuevoConcepto,
      cantidad: Number(nuevaCantidad),
      precioUnitario: Number(nuevoPrecio)
    };
    
    setItems([...items, item]);
    
    // Limpiar campos
    setNuevoConcepto("");
    setSearchTerm("");
    setNuevaCantidad("");
    setNuevoPrecio("");
    setItemInventarioId(null);
  };

  const eliminarItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 3. Manejar el guardado del formulario (El Cerebro)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!clienteId && !isVentaMostrador) || items.length === 0 || total <= 0) {
      alert("Agrega al menos un material y selecciona un cliente.");
      return;
    }

    setLoading(true);
    
    let finalClienteId = clienteId;

    // Crear o buscar "Público en General" si es Venta de Mostrador
    if (isVentaMostrador) {
      const { data: publicoData } = await supabase.from("clientes").select("id").eq("nombre", "Público en General").limit(1);
      if (publicoData && publicoData.length > 0) {
        finalClienteId = publicoData[0].id;
      } else {
        const { data: newPublico, error: errPub } = await supabase.from("clientes").insert([{ 
          nombre: "Público en General", 
          telefono_whatsapp: "N/A" 
        }]).select().single();
        
        if (errPub) { 
          alert("Error creando cliente genérico"); 
          setLoading(false); 
          return; 
        }
        finalClienteId = newPublico.id;
      }
    }

    // Generar la descripción resumen para la tabla de ventas
    let descripcionVenta = items.map(i => `${i.cantidad}x ${i.concepto}`).join(", ");
    if (isVentaMostrador && nombreMostrador) {
      descripcionVenta = `[Nota: ${nombreMostrador}] ${descripcionVenta}`;
    }

    // Paso A: Guardar la Venta
    const { data: nuevaVenta, error: ventaError } = await supabase.from("ventas").insert([
      { 
        cliente_id: finalClienteId,
        obra_id: (!isVentaMostrador && obraId) ? obraId : null,
        descripcion_material: descripcionVenta,
        total: total,
        tipo_venta: tipoVenta
      }
    ]).select().single();

    if (ventaError || !nuevaVenta) {
      alert("Error al registrar la venta: " + (ventaError?.message || ""));
      setLoading(false);
      return;
    }

    // Paso A.2: Guardar el Envío (si aplica)
    if (requiereEnvio && direccionEnvio) {
      const { error: envioError } = await supabase.from("entregas").insert([
        {
          venta_id: nuevaVenta.id,
          cliente_id: finalClienteId,
          direccion: direccionEnvio,
          estado: 'pendiente'
        }
      ]);
      if (envioError) {
        console.error("Error al programar envío:", envioError);
        alert("La venta se guardó, pero hubo un error al programar el envío.");
      }
    }

    // Paso B: Restar del Inventario cada artículo vendido
    for (const item of items) {
      if (item.inventario_id) {
        // Buscar el stock actual de ese producto
        const productoEnBD = inventario.find(p => p.id === item.inventario_id);
        if (productoEnBD) {
          const nuevoStock = productoEnBD.stock_actual - item.cantidad;
          // Actualizar Supabase
          await supabase.from("inventario").update({ stock_actual: nuevoStock }).eq("id", item.inventario_id);
        }
      }
    }

    // Paso C: Actualizar deuda del cliente si es fiado (No aplica a Mostrador)
    if (tipoVenta === "fiado" && !isVentaMostrador) {
      const clienteSeleccionado = clientes.find(c => c.id === clienteId);
      if (clienteSeleccionado) {
        const nuevoSaldo = parseFloat(clienteSeleccionado.saldo_pendiente) + total;
        await supabase.from("clientes").update({ saldo_pendiente: nuevoSaldo }).eq("id", clienteId);
      }
    }

    // Paso D: Enviar WhatsApp si se solicitó
    if (enviarRecibo) {
      const nombreDestino = isVentaMostrador ? (nombreMostrador || "Cliente") : (clientes.find(c => c.id === clienteId)?.nombre || "Cliente");
      const telefonoDestino = isVentaMostrador ? telefonoMostrador : clientes.find(c => c.id === clienteId)?.telefono_whatsapp;

      let texto = `*Nota de Venta*\nHola ${nombreDestino}, confirmamos tu compra:\n\n`;
      items.forEach(i => {
        texto += `• ${i.cantidad}x ${i.concepto}: ${formatCurrency(i.cantidad * i.precioUnitario)}\n`;
      });
      texto += `\n*TOTAL:* ${formatCurrency(total)}\n\n¡Gracias por tu preferencia!`;

      const telefonoLimpio = telefonoDestino ? telefonoDestino.replace(/\D/g, "") : "";
      
      if (telefonoLimpio) {
        window.open(`https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(texto)}`, '_blank');
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
      }
    }

    // Terminar
    router.refresh();
    router.push("/ventas");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 relative">
      
      {/* Componente Lector de Cámara */}
      {isScanning && (
        <BarcodeScanner 
          onScan={handleScan} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      {/* Modal de Error de Escaneo */}
      {scanError && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
            <p className="text-gray-600 text-sm mb-6">{scanError}</p>
            <div className="flex gap-3">
              <button onClick={() => setScanError("")} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition-colors">Cerrar</button>
              <button onClick={() => {setScanError(""); setIsScanning(true);}} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                Escanear Otro
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/ventas" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Punto de Venta / Salida</h1>
            <p className="mt-1 text-sm text-gray-500">
              Registra el material, descuéntalo del inventario y cóbralo o fíalo.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsScanning(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-all"
        >
          <ScanLine size={18} />
          <span className="hidden sm:inline">Escanear Producto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: Datos y Buscador */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Tarjeta Cliente y Obra */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Destino del Material</h3>
            
            <div className="flex bg-gray-100 p-1 rounded-lg mb-2">
              <button
                type="button"
                onClick={() => { setIsVentaMostrador(true); setTipoVenta("contado"); }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${isVentaMostrador ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                Público en General
              </button>
              <button
                type="button"
                onClick={() => setIsVentaMostrador(false)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!isVentaMostrador ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                Cliente Registrado
              </button>
            </div>

            {isVentaMostrador && (
              <div className="space-y-3 mt-3">
                <div>
                  <label htmlFor="nombreMostrador" className="block text-xs font-medium text-gray-700 mb-1">Nombre en la nota (Opcional)</label>
                  <input
                    id="nombreMostrador"
                    type="text"
                    value={nombreMostrador}
                    onChange={(e) => setNombreMostrador(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="telefonoMostrador" className="block text-xs font-medium text-gray-700 mb-1">WhatsApp para recibo (Opcional)</label>
                  <input
                    id="telefonoMostrador"
                    type="tel"
                    value={telefonoMostrador}
                    onChange={(e) => setTelefonoMostrador(e.target.value)}
                    placeholder="10 dígitos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
            )}

            {!isVentaMostrador && (
              <>
                <div>
                  <label htmlFor="cliente" className="block text-xs font-medium text-gray-700 mb-1">Cliente *</label>
                  <select
                    id="cliente"
                    required={!isVentaMostrador}
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    disabled={fetching || clientes.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-gray-50"
                  >
                    {fetching ? <option>Cargando...</option> : clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="obra" className="block text-xs font-medium text-gray-700 mb-1">Obra (Opcional)</label>
                  <select
                    id="obra"
                    value={obraId}
                    onChange={(e) => setObraId(e.target.value)}
                    disabled={fetchingObras || obras.length === 0 || !clienteId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm disabled:bg-gray-50"
                  >
                    <option value="">-- Sin asignar --</option>
                    {obras.map((o) => <option key={o.id} value={o.id}>{o.titulo}</option>)}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Tipo de Venta *</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setTipoVenta("contado")}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${tipoVenta === "contado" ? "bg-white text-green-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                >
                  <Banknote size={14} /> Contado
                </button>
                <button
                  type="button"
                  onClick={() => setTipoVenta("fiado")}
                  disabled={isVentaMostrador}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${tipoVenta === "fiado" ? "bg-white text-amber-700 shadow-sm" : "text-gray-600 hover:text-gray-900"} ${isVentaMostrador ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={isVentaMostrador ? "No se puede fiar al público en general" : ""}
                >
                  <Tag size={14} /> Fiado
                </button>
              </div>
            </div>

            {/* Opciones de Logística */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={requiereEnvio}
                  onChange={(e) => setRequiereEnvio(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                  <Truck size={16} className={requiereEnvio ? "text-blue-600" : "text-gray-400"} />
                  Requiere Entrega a Domicilio
                </span>
              </label>

              {requiereEnvio && (
                <div className="mt-3">
                  <label htmlFor="direccion" className="block text-xs font-medium text-gray-700 mb-1">Dirección de Entrega *</label>
                  <textarea
                    id="direccion"
                    required={requiereEnvio}
                    rows={2}
                    value={direccionEnvio}
                    onChange={(e) => setDireccionEnvio(e.target.value)}
                    placeholder="Ej. Calle Pino Suárez #123, Col. Centro..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta Buscador de Inventario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Agregar Material</h3>
            
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-medium text-gray-700 mb-1">Buscar en Inventario</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setNuevoConcepto(e.target.value);
                    setItemInventarioId(null); // Reset id if typing freely
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Ej. Cemento..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none text-sm transition-all"
                  autoComplete="off"
                />
              </div>

              {showDropdown && inventario.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredInventario.length > 0 ? (
                    <ul className="py-1">
                      {filteredInventario.map(p => (
                        <li key={p.id} onClick={() => handleSelectProduct(p)} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center group">
                          <div>
                            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">{p.nombre}</div>
                            <div className="text-xs text-gray-500">Stock: {p.stock_actual} {p.unidad_medida} | {formatCurrency(p.precio_unitario)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-3 py-3 text-xs text-gray-500 text-center">No se encontraron coincidencias.</div>
                  )}
                </div>
              )}
            </div>
            
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Precio Unit.</label>
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
              <Plus size={16} /> Agregar al carrito
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: Carrito de Compras */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden flex flex-col h-fit">
          <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Carrito de Venta</h3>
          </div>

          <div className="p-5 flex-1 overflow-x-auto min-h-[250px]">
            {items.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2">Cant.</th>
                    <th className="px-3 py-2">Material</th>
                    <th className="px-3 py-2 text-right">Precio U.</th>
                    <th className="px-3 py-2 text-right">Importe</th>
                    <th className="px-3 py-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-900">{item.cantidad}</td>
                      <td className="px-3 py-3">
                        {item.concepto}
                        {item.inventario_id && <span className="ml-2 inline-flex text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded-sm">En Inventario</span>}
                      </td>
                      <td className="px-3 py-3 text-right">{formatCurrency(item.precioUnitario)}</td>
                      <td className="px-3 py-3 text-right font-medium">{formatCurrency(item.cantidad * item.precioUnitario)}</td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => eliminarItem(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                <ShoppingCart size={40} className="mb-3 opacity-20" />
                <p>Agrega materiales para cobrar.</p>
              </div>
            )}
          </div>

          {/* Resumen de Totales y Guardar */}
          <div className="bg-gray-50 p-5 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-gray-900">Total a Pagar:</span>
              <span className="text-3xl font-black text-blue-600">{formatCurrency(total)}</span>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer bg-green-50 p-3 rounded-lg border border-green-200">
                <input 
                  type="checkbox" 
                  checked={enviarRecibo}
                  onChange={(e) => setEnviarRecibo(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                />
                <span className="text-sm font-medium text-green-800 flex items-center gap-1.5">
                  <Send size={16} />
                  Generar y Enviar Nota por WhatsApp
                </span>
              </label>
            </div>

            {tipoVenta === "fiado" && total > 0 && (
              <div className="mb-4 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                ⚠️ Al confirmar, este total se le sumará a la deuda del cliente.
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              {loading ? (
                <><Loader2 size={20} className="animate-spin" /> Procesando Venta e Inventario...</>
              ) : (
                <><Save size={20} /> Confirmar Venta / Salida</>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
