import React from "react";
import clsx from "clsx";
import { Building2, Clock, CheckCircle2 } from "lucide-react";

export type ProjectStatus = "activo" | "pausado" | "finalizado";

interface ProjectCardProps {
  title: string;
  client: string;
  progress: number;
  status: ProjectStatus;
}

export function ProjectCard({ title, client, progress, status }: ProjectCardProps) {
  // Truncar el título si supera los 50 caracteres
  const displayTitle = title.length > 50 ? `${title.substring(0, 47)}...` : title;

  // Configuración de colores e iconos según el estado
  const statusConfig = {
    activo: {
      color: "bg-green-100 text-green-700",
      barColor: "bg-green-500",
      icon: Building2,
      label: "Activo",
    },
    pausado: {
      color: "bg-amber-100 text-amber-700",
      barColor: "bg-amber-500",
      icon: Clock,
      label: "Pausado",
    },
    finalizado: {
      color: "bg-blue-100 text-blue-700",
      barColor: "bg-blue-500",
      icon: CheckCircle2,
      label: "Finalizado",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Cabecera de la tarjeta */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 leading-tight" title={title}>
            {displayTitle}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Cliente: {client}</p>
        </div>
        <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.color)}>
          <StatusIcon size={14} />
          <span>{config.label}</span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-bold text-gray-900">{progress}%</span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={clsx("h-full rounded-full transition-all duration-500", config.barColor)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
