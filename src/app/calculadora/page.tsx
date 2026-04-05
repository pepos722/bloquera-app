"use client";

import React, { useState } from "react";
import { Calculator, Cuboid, Droplet, Cylinder, Pickaxe, Maximize, HardHat, SquareSquare, Hammer } from "lucide-react";
import clsx from "clsx";

type TipoCalculo = "muro" | "firme" | "losa";

export default function CalculadoraPage() {
  // Estado principal
  const [tipo, setTipo] = useState<TipoCalculo>("muro");
  
  // Entradas generales
  const [largo, setLargo] = useState<number | "">("");
  const [ancho, setAncho] = useState<number | "">(""); // Ancho o Alto dependiendo del tipo
  
  // Entradas específicas
  const [espesor, setEspesor] = useState<number>(10); // cm (para firmes y losas)

  // Cálculo de área y volumen
  const l = typeof largo === "number" ? largo : 0;
  const a = typeof ancho === "number" ? ancho : 0;
  
  const area = l * a;
  const volumen = area * (espesor / 100); // m3

  // ==========================================
  // LÓGICA DE CÁLCULOS SEGÚN EL TIPO
  // ==========================================

  // --- 1. MURO DE BLOCK (15x20x40) ---
  const blocks = Math.ceil(area * 12.5 * 1.05); // 12.5 por m2 + 5% desperdicio
  const cementoMuro = Math.ceil(area / 3); // 1 bulto rinde ~3m2 de pegado
  const arenaMuro = cementoMuro * 4; // botes
  const varillaMuro = l > 0 ? Math.ceil(l / 3) * 4 : 0; // 4 varillas por castillo cada 3m
  const jornalesMuro = Math.ceil(area / 8); // 8m2 por jornada

  // --- 2. FIRME DE CONCRETO (Piso) ---
  // Proporción estándar f'c=150 kg/cm2 (por m3: 6 bultos cemento, 34 botes arena, 35 botes grava)
  const cementoFirme = Math.ceil(volumen * 6);
  const arenaFirme = Math.ceil(volumen * 34);
  const gravaFirme = Math.ceil(volumen * 35);
  const mallaElectrosoldada = Math.ceil(area / 16); // Rollos de malla de 40m2 (aprox considerando traslapes)
  const jornalesFirme = Math.ceil(area / 15); // 15m2 por jornada

  // --- 3. LOSA DE CONCRETO (Techo con varilla) ---
  // Proporción estándar f'c=200 kg/cm2 (por m3: 7 bultos cemento, 33 botes arena, 36 botes grava)
  const cementoLosa = Math.ceil(volumen * 7);
  const arenaLosa = Math.ceil(volumen * 33);
  const gravaLosa = Math.ceil(volumen * 36);
  const varillaLosa = Math.ceil((area * 4) / 12); // Varilla de 3/8 armada a cada 20cm (Aprox 4 varillas de 12m por m2)
  const alambreRecocido = Math.ceil(area * 0.5); // Kilos de alambre (aprox 0.5kg por m2)
  const jornalesLosa = Math.ceil(area / 10); // Incluye cimbrado y colado


  return (
    <div className="space-y-6 pb-24 relative">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center gap-2">
            <Calculator className="text-blue-600" />
            Calculadora de Materiales
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Obtén cotizaciones rápidas para diferentes tipos de construcción.
          </p>
        </div>
      </div>

      {/* Selector de Tipo de Cálculo */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => setTipo("muro")}
          className={clsx(
            "flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all",
            tipo === "muro" ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <SquareSquare size={18} />
          Muro de Block
        </button>
        <button
          onClick={() => setTipo("firme")}
          className={clsx(
            "flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all",
            tipo === "firme" ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Hammer size={18} />
          Firme / Piso
        </button>
        <button
          onClick={() => setTipo("losa")}
          className={clsx(
            "flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all",
            tipo === "losa" ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <HardHat size={18} />
          Losa de Techo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel de Entradas (Izquierda) */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900">
            Medidas del {tipo === "muro" ? "Muro" : tipo === "firme" ? "Piso" : "Techo"}
          </h3>
          
          <div>
            <label htmlFor="largo" className="block text-sm font-medium text-gray-700 mb-1">
              Largo (Metros)
            </label>
            <div className="relative">
              <input
                type="number"
                id="largo"
                min="0"
                step="0.1"
                value={largo}
                onChange={(e) => setLargo(e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. 5.5"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">m</div>
            </div>
          </div>

          <div>
            <label htmlFor="ancho" className="block text-sm font-medium text-gray-700 mb-1">
              {tipo === "muro" ? "Alto (Metros)" : "Ancho (Metros)"}
            </label>
            <div className="relative">
              <input
                type="number"
                id="ancho"
                min="0"
                step="0.1"
                value={ancho}
                onChange={(e) => setAncho(e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={tipo === "muro" ? "Ej. 2.5" : "Ej. 4.0"}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">m</div>
            </div>
          </div>

          {(tipo === "firme" || tipo === "losa") && (
            <div>
              <label htmlFor="espesor" className="block text-sm font-medium text-gray-700 mb-1">
                Espesor (Centímetros)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="espesor"
                  min="1"
                  step="1"
                  value={espesor}
                  onChange={(e) => setEspesor(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-medium">cm</div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-gray-700">
              <span className="font-medium flex items-center gap-2">
                <Maximize size={18} className="text-blue-500" />
                Área:
              </span>
              <span className="text-xl font-bold text-gray-900">{area.toFixed(2)} m²</span>
            </div>
            {(tipo === "firme" || tipo === "losa") && (
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-medium flex items-center gap-2">
                  <Cuboid size={18} className="text-blue-500" />
                  Volumen:
                </span>
                <span className="text-lg font-bold text-gray-900">{volumen.toFixed(2)} m³</span>
              </div>
            )}
          </div>
        </div>

        {/* Panel de Resultados (Derecha) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Material Estimado Recomendado</h3>
          
          {area > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* === RESULTADOS PARA MURO === */}
              {tipo === "muro" && (
                <>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Cuboid size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Block 15x20x40</p>
                      <p className="text-2xl font-bold text-gray-900">{blocks} <span className="text-sm font-normal text-gray-500">pzas</span></p>
                      <p className="text-xs text-gray-400 mt-1">Incluye 5% desperdicio</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8v12h14V8"/><path d="M4 4h16v4H4z"/><path d="M9 12h6"/><path d="M9 16h6"/></svg></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cemento Mortero</p>
                      <p className="text-2xl font-bold text-gray-900">{cementoMuro} <span className="text-sm font-normal text-gray-500">bultos</span></p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0"><Droplet size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Arena</p>
                      <p className="text-2xl font-bold text-gray-900">{arenaMuro} <span className="text-sm font-normal text-gray-500">botes (19L)</span></p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"><Cylinder size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Varilla 3/8</p>
                      <p className="text-2xl font-bold text-gray-900">{varillaMuro} <span className="text-sm font-normal text-gray-500">tramos</span></p>
                      <p className="text-xs text-gray-400 mt-1">Para castillos a cada 3m</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 sm:col-span-2">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Pickaxe size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Mano de Obra Estimada</p>
                      <p className="text-2xl font-bold text-gray-900">{jornalesMuro} <span className="text-sm font-normal text-gray-500">jornadas</span></p>
                    </div>
                  </div>
                </>
              )}

              {/* === RESULTADOS PARA FIRME/PISO === */}
              {tipo === "firme" && (
                <>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8v12h14V8"/><path d="M4 4h16v4H4z"/><path d="M9 12h6"/><path d="M9 16h6"/></svg></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cemento Gris</p>
                      <p className="text-2xl font-bold text-gray-900">{cementoFirme} <span className="text-sm font-normal text-gray-500">bultos</span></p>
                      <p className="text-xs text-gray-400 mt-1">Mezcla f'c=150 kg/cm²</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0"><Droplet size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Arena</p>
                      <p className="text-2xl font-bold text-gray-900">{arenaFirme} <span className="text-sm font-normal text-gray-500">botes</span></p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center shrink-0"><Droplet size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Grava</p>
                      <p className="text-2xl font-bold text-gray-900">{gravaFirme} <span className="text-sm font-normal text-gray-500">botes</span></p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"><SquareSquare size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Malla Electrosoldada</p>
                      <p className="text-2xl font-bold text-gray-900">{mallaElectrosoldada} <span className="text-sm font-normal text-gray-500">rollos</span></p>
                    </div>
                  </div>
                </>
              )}

              {/* === RESULTADOS PARA LOSA/TECHO === */}
              {tipo === "losa" && (
                <>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8v12h14V8"/><path d="M4 4h16v4H4z"/><path d="M9 12h6"/><path d="M9 16h6"/></svg></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cemento Gris</p>
                      <p className="text-2xl font-bold text-gray-900">{cementoLosa} <span className="text-sm font-normal text-gray-500">bultos</span></p>
                      <p className="text-xs text-gray-400 mt-1">Mezcla f'c=200 kg/cm²</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0"><Droplet size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Arena y Grava</p>
                      <p className="text-lg font-bold text-gray-900">{arenaLosa} A / {gravaLosa} G</p>
                      <p className="text-xs text-gray-400 mt-1">Botes de 19L</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0"><Cylinder size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Varilla 3/8</p>
                      <p className="text-2xl font-bold text-gray-900">{varillaLosa} <span className="text-sm font-normal text-gray-500">tramos</span></p>
                      <p className="text-xs text-gray-400 mt-1">Armado a cada 20cm</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 text-stone-700 flex items-center justify-center shrink-0"><Cylinder size={24} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Alambre Recocido</p>
                      <p className="text-2xl font-bold text-gray-900">{alambreRecocido} <span className="text-sm font-normal text-gray-500">kg</span></p>
                    </div>
                  </div>
                </>
              )}

            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
              <Calculator className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-sm font-medium text-gray-900">Ingresa las medidas</h3>
              <p className="mt-1 text-sm text-gray-500">Los cálculos de material aparecerán aquí automáticamente.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
