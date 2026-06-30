// src/App.jsx
import { useMemo, useState } from "react";
import {
  Building2,
  Camera,
  CarFront,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  Save,
  UserRound,
  Sparkles,
  ArrowRight,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { apiRecepcionVolvo } from "./lib/apiRecepcionVolvo";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const ASESORES_VOLVO = [
  "Edgar Valencia",
  "Carlos Macedonio",
  "Luis Enrique Ramos",
  "Juan Carlos Ubaldo",
];

const METODOS_CONTACTO = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "correo", label: "Correo" },
  { value: "llamada", label: "Llamada" },
];

const CHECKLIST_VOLVO = [
  {
    titulo: "Inspección física",
    items: [
      ["revisar_carroceria", "Revisar carrocería junto con el cliente"],
      ["registrar_danos", "Registrar golpes, rayones o daños existentes"],
      ["tomar_fotografias", "Tomar fotografías del vehículo"],
      ["revisar_llantas_rines", "Revisar estado de llantas y rines"],
      ["verificar_combustible", "Verificar nivel de combustible"],
      ["revisar_testigos_tablero", "Revisar testigos encendidos en tablero si aplica"],
      [
        "confirmar_funcionamiento_basico",
        "Confirmar funcionamiento básico exterior, interior y componentes mecánicos",
      ],
    ],
  },
  {
    titulo: "Objetos y pertenencias",
    items: [
      ["registrar_objetos_valor", "Registrar objetos de valor visibles"],
      ["confirmar_herramientas_accesorios", "Confirmar herramientas o accesorios incluidos"],
      ["solicitar_retiro_pertenencias", "Solicitar retiro de pertenencias importantes o registrarlas"],
    ],
  },
  {
    titulo: "Identificación de necesidades",
    items: [
      ["documentar_falla", "Escuchar y documentar claramente la falla reportada"],
      ["confirmar_sintomas", "Confirmar síntomas, frecuencia y condiciones de la falla"],
      ["preguntas_diagnostico", "Realizar preguntas de diagnóstico relevantes"],
      ["validar_trabajos_previos", "Validar si existen trabajos previos relacionados"],
      ["prueba_ruta_cliente", "Salir a prueba de ruta con cliente si es necesario"],
    ],
  },
  {
    titulo: "Explicación inicial al cliente",
    items: [
      ["explicar_diagnostico", "Explicar el proceso de diagnóstico"],
      ["informar_tiempos", "Informar tiempos estimados"],
      ["informar_costos_revision", "Informar posibles costos de revisión"],
      ["explicar_autorizacion_adicional", "Explicar política de autorización adicional"],
      [
        "confirmar_sin_trabajo_no_autorizado",
        "Confirmar que ningún trabajo adicional se realizará sin autorización",
      ],
    ],
  },
  {
    titulo: "Documentación y autorización",
    items: [
      ["generar_orden_servicio", "Generar orden de servicio"],
      ["obtener_firma_autorizacion", "Obtener firma de autorización del cliente"],
      ["entregar_copia_fisica", "Entregar copia física"],
      ["confirmar_preferencia_contacto", "Confirmar preferencia de contacto WhatsApp/correo"],
    ],
  },
];

const FORM_INICIAL = {
  agencia: "Volvo",
  nombre: "",
  telefono: "",
  correo: "",
  asesor_servicio: "",
  placas: "",
  vin: "",
  modelo: "",
  kilometraje: "",
  fecha_hora_recepcion: dateTimeLocalActual(),
  metodo_contacto_preferido: "whatsapp",
  observaciones: "",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function dateTimeLocalActual() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function soloNumeros(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizarTelefonoMx(value) {
  const digits = soloNumeros(value);
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

function telefonoValido(value) {
  const digits = soloNumeros(value);
  return digits.length === 10 || (digits.length === 12 && digits.startsWith("52"));
}

function emailValido(value) {
  const email = String(value || "").trim();
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function cls(...values) {
  return values.filter(Boolean).join(" ");
}

// ─── COMPONENTES REUTILIZABLES (con el nuevo estilo) ──────────────────────
function Campo({ label, requerido, error, ayuda, children, className = "" }) {
  return (
    <div className={cls("min-w-0", className)}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
        {requerido && <span className="ml-1 text-amber-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {ayuda && !error && <p className="mt-1 text-xs text-gray-400">{ayuda}</p>}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cls(
        "h-12 w-full rounded-xl border-2 bg-white px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300 focus:border-red-400" : "border-gray-200 hover:border-gray-300",
        className
      )}
    />
  );
}

function Select({ error, className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={cls(
        "h-12 w-full rounded-xl border-2 bg-white px-4 pr-10 text-sm text-gray-800 outline-none transition-all appearance-none cursor-pointer focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 1rem center",
      }}
    >
      {children}
    </select>
  );
}

function Textarea({ error, className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cls(
        "min-h-[92px] w-full resize-none rounded-xl border-2 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300",
        className
      )}
    />
  );
}

// ─── Componente para opciones del checklist (3 botones) ──────────────────
function OpcionChecklist({ label, value, onChange, obligatorio = false }) {
  const opciones = [
    { key: "ok", label: "Correcto", icon: CheckCircle2, color: "text-emerald-600 border-emerald-200 bg-emerald-50" },
    { key: "observacion", label: "Observ.", icon: AlertCircle, color: "text-amber-600 border-amber-200 bg-amber-50" },
    { key: "na", label: "N/A", icon: XCircle, color: "text-gray-400 border-gray-200 bg-gray-50" },
  ];

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {obligatorio && (
          <span className="text-[10px] font-bold uppercase text-amber-500">*Obligatorio</span>
        )}
      </div>
      <div className="flex gap-2">
        {opciones.map(({ key, label: optLabel, icon: Icon, color }) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cls(
                "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-semibold transition-all",
                selected
                  ? color
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {optLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── EvidenciasPicker (adaptado al nuevo estilo) ────────────────────────
function EvidenciasPicker({ evidencias, setEvidencias }) {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4">
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center transition hover:bg-gray-100">
        <Camera className="mb-2 h-7 w-7 text-gray-400" />
        <span className="text-sm font-bold text-gray-600">Agregar evidencia</span>
        <span className="mt-1 text-xs font-medium text-gray-400">
          Fotos de carrocería, tablero, daños o pertenencias.
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(event) => setEvidencias(Array.from(event.target.files || []))}
        />
      </label>

      {evidencias.length ? (
        <div className="mt-3 grid gap-2">
          {evidencias.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700"
            >
              {file.name}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [checklist, setChecklist] = useState({});
  const [evidencias, setEvidencias] = useState([]);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [ok, setOk] = useState(false);

  const errores = useMemo(() => {
    const result = {};
    if (!form.nombre.trim()) result.nombre = "Requerido";
    if (!telefonoValido(form.telefono)) result.telefono = "Teléfono inválido";
    if (!emailValido(form.correo)) result.correo = "Correo inválido";
    if (!form.fecha_hora_recepcion) result.fecha = "Requerido";
    if (!form.asesor_servicio) result.asesor = "Selecciona asesor";
    return result;
  }, [form]);

  const progress = useMemo(() => {
    const ids = CHECKLIST_VOLVO.flatMap((section) => section.items.map(([id]) => id));
    const completados = ids.filter((id) => ["ok", "observacion", "na"].includes(checklist[id]?.estado)).length;
    return { completados, total: ids.length };
  }, [checklist]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setOk(false);
  }

  function setEstadoItem(itemId, estado) {
    setChecklist((prev) => {
      const actual = prev[itemId] || { estado: "", comentario: "" };
      const nextEstado = actual.estado === estado ? "" : estado;
      const next = { ...prev, [itemId]: { ...actual, estado: nextEstado } };
      if (!next[itemId].estado && !next[itemId].comentario) delete next[itemId];
      return next;
    });
  }

  function setComentarioItem(itemId, comentario) {
    setChecklist((prev) => {
      const actual = prev[itemId] || { estado: "", comentario: "" };
      const next = { ...prev, [itemId]: { ...actual, comentario } };
      if (!next[itemId].estado && !next[itemId].comentario) delete next[itemId];
      return next;
    });
  }

  function marcarSeccion(items, estado) {
    setChecklist((prev) => {
      const next = { ...prev };
      items.forEach(([itemId]) => {
        next[itemId] = {
          ...(next[itemId] || { comentario: "" }),
          estado,
        };
      });
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setMensaje("");
    setOk(false);

    if (Object.keys(errores).length) {
      setMensaje(Object.values(errores)[0]);
      return;
    }

    setSaving(true);

    try {
      await apiRecepcionVolvo.create({
        ...form,
        telefono: normalizarTelefonoMx(form.telefono),
        checklist,
        evidencias_nuevas: evidencias,
      });

      setOk(true);
      setMensaje("✅ Recepción guardada correctamente.");
      setForm(FORM_INICIAL);
      setChecklist({});
      setEvidencias([]);
    } catch (error) {
      console.error(error);
      setMensaje(error.message || "No fue posible guardar la recepción.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60"
        >
          {/* ═══ HEADER — estilo VOLVO ═══ */}
          <div className="relative overflow-hidden bg-[#1a2a3a] px-8 py-6 md:px-12 md:py-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-amber-400/5 blur-2xl" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
               <h1
                  className="text-5xl font-extralight tracking-[0.6em] text-white uppercase"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  VOLVO
                </h1>
               <p
                  className="text-xs font-light uppercase tracking-[0.25em] text-white"
                  style={{
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
                  }}
                >
                  RECEPCION DE VEHICULOS
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-2.5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-white/80">
                  Automotriz R&amp;R
                </span>
              </div>
            </div>
          </div>

          {/* ═══ SUBHEADER ═══ */}
          <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-4 md:px-12">
            <p className="text-sm text-gray-600">
              Datos generales, checklist y evidencia fotográfica.
            </p>
          </div>

          {/* ═══ MENSAJE ═══ */}
          {mensaje && (
            <div
              className={cls(
                "mx-8 mt-6 rounded-xl border px-5 py-3.5 text-sm font-medium md:mx-12",
                ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {mensaje}
            </div>
          )}

          {/* ═══ FORMULARIO ═══ */}
          <form onSubmit={submit} className="p-6 md:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
              {/* ── Columna izquierda: Datos generales y vehículo ── */}
              <div className="space-y-6">
                {/* Datos generales */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                    <UserRound className="h-4 w-4" />
                    Datos generales
                  </h2>

                  <div className="grid gap-4">
                    <Campo label="Dealer">
                      <Input value={form.agencia} disabled className="bg-gray-50 cursor-not-allowed" />
                    </Campo>

                    <Campo label="Cliente" requerido error={errores.nombre}>
                      <Input
                        value={form.nombre}
                        error={errores.nombre}
                        onChange={(event) => setField("nombre", event.target.value.toUpperCase())}
                        placeholder="NOMBRE COMPLETO"
                      />
                    </Campo>

                    <Campo label="Teléfono" requerido error={errores.telefono} ayuda="10 dígitos o 52 + 10 dígitos">
                      <Input
                        value={form.telefono}
                        error={errores.telefono}
                        onChange={(event) => setField("telefono", soloNumeros(event.target.value).slice(0, 12))}
                        inputMode="numeric"
                        placeholder="2711234567"
                      />
                    </Campo>

                    <Campo label="Correo" error={errores.correo}>
                      <Input
                        type="email"
                        value={form.correo}
                        error={errores.correo}
                        onChange={(event) => setField("correo", event.target.value)}
                        placeholder="correo@dominio.com"
                      />
                    </Campo>

                    <Campo label="Asesor" requerido error={errores.asesor}>
                      <Select
                        value={form.asesor_servicio}
                        error={errores.asesor}
                        onChange={(event) => setField("asesor_servicio", event.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {ASESORES_VOLVO.map((asesor) => (
                          <option key={asesor} value={asesor}>
                            {asesor}
                          </option>
                        ))}
                      </Select>
                    </Campo>

                    <Campo label="Fecha recepción" requerido error={errores.fecha}>
                      <Input
                        type="datetime-local"
                        value={form.fecha_hora_recepcion}
                        error={errores.fecha}
                        onChange={(event) => setField("fecha_hora_recepcion", event.target.value)}
                      />
                    </Campo>

                    <Campo label="Contacto preferido">
                      <Select
                        value={form.metodo_contacto_preferido}
                        onChange={(event) => setField("metodo_contacto_preferido", event.target.value)}
                      >
                        {METODOS_CONTACTO.map((metodo) => (
                          <option key={metodo.value} value={metodo.value}>
                            {metodo.label}
                          </option>
                        ))}
                      </Select>
                    </Campo>
                  </div>
                </div>

                {/* Vehículo */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                    <CarFront className="h-4 w-4" />
                    Vehículo
                  </h2>

                  <div className="grid gap-4">
                    <Campo label="Placas">
                      <Input
                        value={form.placas}
                        onChange={(event) => setField("placas", event.target.value.toUpperCase())}
                        placeholder="ABC123"
                      />
                    </Campo>

                    <Campo label="VIN">
                      <Input
                        value={form.vin}
                        onChange={(event) => setField("vin", event.target.value.toUpperCase())}
                        placeholder="VIN"
                      />
                    </Campo>

                    <Campo label="Modelo">
                      <Input
                        value={form.modelo}
                        onChange={(event) => setField("modelo", event.target.value)}
                        placeholder="XC60"
                      />
                    </Campo>

                    <Campo label="Kilometraje">
                      <Input
                        value={form.kilometraje}
                        onChange={(event) => setField("kilometraje", soloNumeros(event.target.value))}
                        inputMode="numeric"
                        placeholder="35000"
                      />
                    </Campo>

                    <Campo label="Observaciones">
                      <Textarea
                        value={form.observaciones}
                        onChange={(event) => setField("observaciones", event.target.value)}
                        placeholder="Comentarios generales de recepción..."
                      />
                    </Campo>

                    <EvidenciasPicker evidencias={evidencias} setEvidencias={setEvidencias} />
                  </div>
                </div>
              </div>

              {/* ── Columna derecha: Checklist ── */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                    <ClipboardList className="h-4 w-4" />
                    Checklist de recepción
                  </h2>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                    {progress.completados}/{progress.total} completados
                  </span>
                </div>

                <div className="space-y-4">
                  {CHECKLIST_VOLVO.map((section) => (
                    <section
                      key={section.titulo}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-sm font-bold text-gray-700">{section.titulo}</h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => marcarSeccion(section.items, "ok")}
                            className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                          >
                            Todo OK
                          </button>
                          <button
                            type="button"
                            onClick={() => marcarSeccion(section.items, "na")}
                            className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-200 transition"
                          >
                            Todo N/A
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {section.items.map(([itemId, description]) => {
                          const current = checklist[itemId] || { estado: "", comentario: "" };
                          const mostrarComentario = current.estado === "observacion";

                          return (
                            <div key={itemId} className="grid gap-3 p-4 lg:grid-cols-[1fr_280px]">
                              <div>
                                <p className="text-sm font-medium leading-snug text-gray-700">
                                  {description}
                                </p>
                                {mostrarComentario && (
                                  <input
                                    value={current.comentario || ""}
                                    onChange={(e) => setComentarioItem(itemId, e.target.value)}
                                    placeholder="Comentario de la observación..."
                                    className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#1a2a3a] focus:ring-2 focus:ring-[#1a2a3a]/10"
                                  />
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEstadoItem(itemId, "ok")}
                                  className={cls(
                                    "flex-1 rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all",
                                    current.estado === "ok"
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                  )}
                                >
                                  <CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />
                                  Correcto
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEstadoItem(itemId, "observacion")}
                                  className={cls(
                                    "flex-1 rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all",
                                    current.estado === "observacion"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                  )}
                                >
                                  <AlertCircle className="inline h-3.5 w-3.5 mr-1" />
                                  Observ.
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEstadoItem(itemId, "na")}
                                  className={cls(
                                    "flex-1 rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all",
                                    current.estado === "na"
                                      ? "border-gray-200 bg-gray-50 text-gray-600"
                                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                  )}
                                >
                                  <XCircle className="inline h-3.5 w-3.5 mr-1" />
                                  N/A
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══ FOOTER — Botón guardar ═══ */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50/80 px-6 py-4 md:flex-row">
              <p className="text-sm text-gray-500">
                📋 Revisa los datos y guarda el registro.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a2a3a] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#2a3a4a] hover:shadow-lg hover:shadow-[#1a2a3a]/20 disabled:opacity-60 md:w-auto"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    Guardar recepción
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}