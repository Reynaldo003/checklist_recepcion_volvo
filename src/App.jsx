// src/App.jsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  Sparkles,
  UserRound,
  ArrowRight,
} from "lucide-react";

import { apiRecepcionVolvo } from "./lib/apiRecepcionVolvo";

// ─── CONSTANTES ───
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

function dateTimeLocalActual() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

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

// ─── UTILITY FUNCTIONS ───
function cls(...clases) {
  return clases.filter(Boolean).join(" ");
}
function soloNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}
function normalizarTelefonoMx(valor) {
  const telefono = soloNumeros(valor);
  if (telefono.length === 10) return `52${telefono}`;
  if (telefono.length === 12 && telefono.startsWith("52")) return telefono;
  return telefono;
}
function validarTelefono(valor) {
  const telefono = soloNumeros(valor);
  if (telefono.length === 10) return true;
  if (telefono.length === 12 && telefono.startsWith("52")) return true;
  return false;
}
function mensajeTelefono(valor) {
  const telefono = soloNumeros(valor);
  if (!telefono) return "Captura un teléfono numérico.";
  if (telefono.length < 10) return "El teléfono debe tener mínimo 10 dígitos.";
  if (telefono.length === 11) return "Usa 10 dígitos o 52 + 10 dígitos.";
  if (telefono.length === 12 && !telefono.startsWith("52")) {
    return "Si tiene 12 dígitos debe iniciar con 52.";
  }
  if (telefono.length > 12) return "Máximo 12 dígitos.";
  return "Teléfono inválido.";
}
function validarEmail(valor) {
  const email = String(valor ?? "").trim();
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
function obtenerErrores(form) {
  const errores = {};
  if (!String(form.nombre ?? "").trim()) errores.nombre = "Captura el nombre del cliente.";
  if (!validarTelefono(form.telefono)) errores.telefono = mensajeTelefono(form.telefono);
  if (!validarEmail(form.correo)) errores.correo = "Correo inválido.";
  if (!form.asesor_servicio) errores.asesor_servicio = "Selecciona asesor de servicio.";
  if (!form.fecha_hora_recepcion) errores.fecha_hora_recepcion = "Captura la fecha de recepción.";
  return errores;
}

// ─── COMPONENTES BASE (estilo Tráfico de Piso) ───

function Campo({ label, requerido, error, ayuda, icon: Icon, children, className = "" }) {
  return (
    <div className={cls("min-w-0", className)}>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
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
        "h-12 w-full rounded-2xl border-2 bg-white px-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300 focus:border-red-400" : "border-gray-200 hover:border-gray-300",
        props.disabled && "cursor-not-allowed opacity-60",
        className
      )}
    />
  );
}

function Select({ error, children, className = "", ...props }) {
  return (
    <select
      {...props}
      className={cls(
        "h-12 w-full rounded-2xl border-2 bg-white px-4 pr-10 text-sm text-gray-800 outline-none transition-all appearance-none cursor-pointer focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
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
        "min-h-[92px] w-full resize-none rounded-2xl border-2 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#1a2a3a] focus:shadow-[0_0_0_4px_rgba(26,42,58,0.08)]",
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300",
        className
      )}
    />
  );
}

function EstadoButton({ active, children, onClick, tone }) {
  const activeClass = {
    ok: "border-emerald-300 bg-emerald-50 text-emerald-700",
    observacion: "border-amber-300 bg-amber-50 text-amber-700",
    na: "border-gray-300 bg-gray-100 text-gray-600",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "h-9 rounded-xl border-2 px-3 text-xs font-bold transition-all",
        active ? activeClass : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
      )}
    >
      {children}
    </button>
  );
}

function ChecklistCard({ checklist, onChange }) {
  function setEstado(itemId, estado) {
    onChange((prev) => {
      const actual = prev[itemId] || { estado: "", comentario: "" };
      const nextEstado = actual.estado === estado ? "" : estado;
      const next = { ...prev, [itemId]: { ...actual, estado: nextEstado } };
      if (!next[itemId].estado && !next[itemId].comentario) delete next[itemId];
      return next;
    });
  }

  function setComentario(itemId, comentario) {
    onChange((prev) => {
      const actual = prev[itemId] || { estado: "", comentario: "" };
      const next = { ...prev, [itemId]: { ...actual, comentario } };
      if (!next[itemId].estado && !next[itemId].comentario) delete next[itemId];
      return next;
    });
  }

  function marcarSeccion(items, estado) {
    onChange((prev) => {
      const next = { ...prev };
      items.forEach(([itemId]) => {
        next[itemId] = { ...(next[itemId] || { comentario: "" }), estado };
      });
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {CHECKLIST_VOLVO.map((section) => (
        <section
          key={section.titulo}
          className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white"
        >
          <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-bold text-[#1a2a3a]">{section.titulo}</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => marcarSeccion(section.items, "ok")}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
              >
                Todo OK
              </button>
              <button
                type="button"
                onClick={() => marcarSeccion(section.items, "na")}
                className="rounded-xl border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-200"
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
                <div key={itemId} className="grid gap-3 p-4 lg:grid-cols-[1fr_310px]">
                  <div>
                    <p className="text-sm font-medium leading-snug text-gray-700">{description}</p>
                    {mostrarComentario ? (
                      <input
                        value={current.comentario || ""}
                        onChange={(event) => setComentario(itemId, event.target.value)}
                        placeholder="Comentario de la observación..."
                        className="mt-2 h-10 w-full rounded-xl border-2 border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-[#1a2a3a]"
                      />
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <EstadoButton active={current.estado === "ok"} tone="ok" onClick={() => setEstado(itemId, "ok")}>
                      Correcto
                    </EstadoButton>
                    <EstadoButton
                      active={current.estado === "observacion"}
                      tone="observacion"
                      onClick={() => setEstado(itemId, "observacion")}
                    >
                      Observ.
                    </EstadoButton>
                    <EstadoButton active={current.estado === "na"} tone="na" onClick={() => setEstado(itemId, "na")}>
                      N/A
                    </EstadoButton>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function EvidenciasPicker({ evidencias, setEvidencias }) {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-4">
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/70 px-4 py-5 text-center transition hover:bg-gray-100">
        <Camera className="mb-2 h-7 w-7 text-gray-400" />
        <span className="text-sm font-bold text-[#1a2a3a]">Agregar evidencia</span>
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
              className="flex items-center gap-2 truncate rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span className="truncate">{file.name}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ───

export default function RecepcionVolvo() {
  const [form, setForm] = useState(FORM_INICIAL);
  const [checklist, setChecklist] = useState({});
  const [evidencias, setEvidencias] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [guardado, setGuardado] = useState(false);

  const errores = useMemo(() => obtenerErrores(form), [form]);
  const hayErrores = Object.keys(errores).length > 0;

  const progreso = useMemo(() => {
    const ids = CHECKLIST_VOLVO.flatMap((section) => section.items.map(([id]) => id));
    const completados = ids.filter((id) => ["ok", "observacion", "na"].includes(checklist[id]?.estado)).length;
    return { completados, total: ids.length };
  }, [checklist]);

  function updateField(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  function error(campo) {
    return mostrarErrores ? errores[campo] : "";
  }

  async function enviarFormulario(e) {
    e.preventDefault();
    setMostrarErrores(true);
    setMensaje("");
    setGuardado(false);

    const erroresActuales = obtenerErrores(form);
    if (Object.keys(erroresActuales).length > 0) {
      setMensaje(Object.values(erroresActuales)[0]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setEnviando(true);
      await apiRecepcionVolvo.create({
        ...form,
        telefono: normalizarTelefonoMx(form.telefono),
        checklist,
        evidencias_nuevas: evidencias,
      });
      setGuardado(true);
      setMensaje("✅ Recepción guardada correctamente.");
      setForm(FORM_INICIAL);
      setChecklist({});
      setEvidencias([]);
      setMostrarErrores(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setMensaje(err.message || "No fue posible guardar la recepción.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60"
        >
          {/* HEADER — Estilo Volvo */}
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
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  RECEPCIÓN DE VEHÍCULO
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-2.5 backdrop-blur">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-white/80">Automotriz R&amp;R</span>
              </div>
            </div>
          </div>

          {/* SUBHEADER */}
          <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-4 md:px-12">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Captura los datos generales, el checklist de recepción y la evidencia fotográfica.
              </p>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#1a2a3a] px-3 py-1 text-xs font-bold text-white">
                {progreso.completados}/{progreso.total} checklist
              </span>
            </div>
          </div>

          {/* MENSAJE */}
          {mensaje && (
            <div
              className={cls(
                "mx-8 mt-6 rounded-2xl border px-5 py-3.5 text-sm font-medium md:mx-12",
                guardado
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              )}
            >
              {mensaje}
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={enviarFormulario} className="p-6 md:p-10">
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
              {/* Columna izquierda: Datos generales + Vehículo */}
              <div className="space-y-6">
                <div className="rounded-3xl border-2 border-gray-100 bg-gray-50/40 p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1a2a3a]">
                    <UserRound className="h-4 w-4" />
                    Datos generales
                  </h2>
                  <div className="grid gap-4">
                    <Campo label="Dealer" icon={Building2}>
                      <Input value={form.agencia} disabled />
                    </Campo>

                    <Campo label="Cliente" requerido icon={UserRound} error={error("nombre")}>
                      <Input
                        value={form.nombre}
                        error={error("nombre")}
                        onChange={(e) => updateField("nombre", e.target.value.toUpperCase())}
                        placeholder="NOMBRE COMPLETO"
                      />
                    </Campo>

                    <Campo
                      label="Teléfono"
                      requerido
                      icon={Phone}
                      error={error("telefono")}
                      ayuda="10 dígitos o 52 + 10 dígitos"
                    >
                      <Input
                        value={form.telefono}
                        error={error("telefono")}
                        onChange={(e) => updateField("telefono", soloNumeros(e.target.value).slice(0, 12))}
                        inputMode="numeric"
                        placeholder="2711234567"
                      />
                    </Campo>

                    <Campo label="Correo" icon={Mail} error={error("correo")}>
                      <Input
                        type="email"
                        value={form.correo}
                        error={error("correo")}
                        onChange={(e) => updateField("correo", e.target.value)}
                        placeholder="correo@dominio.com"
                      />
                    </Campo>

                    <Campo label="PST" requerido icon={UserRound} error={error("asesor_servicio")}>
                      <Select
                        value={form.asesor_servicio}
                        error={error("asesor_servicio")}
                        onChange={(e) => updateField("asesor_servicio", e.target.value)}
                      >
                        <option value="">Seleccionar...</option>
                        {ASESORES_VOLVO.map((asesor) => (
                          <option key={asesor} value={asesor}>
                            {asesor}
                          </option>
                        ))}
                      </Select>
                    </Campo>

                    <Campo
                      label="Fecha recepción"
                      requerido
                      icon={ClipboardList}
                      error={error("fecha_hora_recepcion")}
                    >
                      <Input
                        type="datetime-local"
                        value={form.fecha_hora_recepcion}
                        error={error("fecha_hora_recepcion")}
                        onChange={(e) => updateField("fecha_hora_recepcion", e.target.value)}
                      />
                    </Campo>

                    <Campo label="Contacto preferido" icon={MessageSquareText}>
                      <Select
                        value={form.metodo_contacto_preferido}
                        onChange={(e) => updateField("metodo_contacto_preferido", e.target.value)}
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

                <div className="rounded-3xl border-2 border-gray-100 bg-gray-50/40 p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1a2a3a]">
                    <CarFront className="h-4 w-4" />
                    Vehículo
                  </h2>
                  <div className="grid gap-4">
                    <Campo label="Placas" icon={CarFront}>
                      <Input
                        value={form.placas}
                        onChange={(e) => updateField("placas", e.target.value.toUpperCase())}
                        placeholder="ABC123"
                      />
                    </Campo>

                    <Campo label="VIN" icon={ClipboardList}>
                      <Input
                        value={form.vin}
                        onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
                        placeholder="VIN"
                      />
                    </Campo>

                    <Campo label="Modelo" icon={CarFront}>
                      <Input
                        value={form.modelo}
                        onChange={(e) => updateField("modelo", e.target.value)}
                        placeholder="XC60"
                      />
                    </Campo>

                    <Campo label="Kilometraje" icon={Gauge}>
                      <Input
                        value={form.kilometraje}
                        onChange={(e) => updateField("kilometraje", soloNumeros(e.target.value))}
                        inputMode="numeric"
                        placeholder="35000"
                      />
                    </Campo>

                    <Campo label="Observaciones" icon={MessageSquareText}>
                      <Textarea
                        value={form.observaciones}
                        onChange={(e) => updateField("observaciones", e.target.value)}
                        placeholder="Comentarios generales de recepción..."
                        rows={3}
                      />
                    </Campo>

                    <EvidenciasPicker evidencias={evidencias} setEvidencias={setEvidencias} />
                  </div>
                </div>
              </div>

              {/* Columna derecha: Checklist */}
              <div className="rounded-3xl border-2 border-gray-100 bg-gray-50/40 p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1a2a3a]">
                    <ClipboardList className="h-4 w-4" />
                    Checklist de recepción
                  </h2>
                  <span className="w-fit rounded-full bg-[#1a2a3a] px-3 py-1 text-xs font-bold text-white">
                    {progreso.completados}/{progreso.total} completados
                  </span>
                </div>
                <ChecklistCard checklist={checklist} onChange={setChecklist} />
              </div>
            </div>

            {/* FOOTER — Botón guardar */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gray-50/80 px-6 py-4 md:flex-row">
              <p className="text-sm text-gray-500">
                {mostrarErrores && hayErrores
                  ? `⚠️ ${Object.values(errores)[0]}`
                  : "📋 Revisa los datos y guarda la recepción."}
              </p>
              <button
                type="submit"
                disabled={enviando}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a2a3a] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#2a3a4a] hover:shadow-lg hover:shadow-[#1a2a3a]/20 disabled:opacity-60 md:w-auto"
              >
                {enviando ? (
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
