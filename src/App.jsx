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
} from "lucide-react";

import fondo3 from "./assets/fondo3.jpeg";
import { apiRecepcionVolvo } from "./lib/apiRecepcionVolvo";

const ASESORES_VOLVO = [
  "Enrique Vazquez Islas",
  "Ricardo Platas",
  "Verónica Del Rayo Galindo León",
  "Julio Camacho Barragán",
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

function Field({ label, icon: Icon, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-white/70">
        {Icon ? <Icon className="h-3.5 w-3.5 text-white/45" /> : null}
        {label}
      </label>

      {children}

      {error ? <p className="mt-1 text-[11px] font-bold text-red-200">{error}</p> : null}
    </div>
  );
}

function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cls(
        "h-11 w-full rounded-xl border bg-white/10 px-3 text-sm font-bold text-white outline-none transition placeholder:text-white/35",
        error ? "border-red-200 ring-2 ring-red-300/20" : "border-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/10",
        className,
      )}
    />
  );
}

function Select({ error, className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={cls(
        "h-11 w-full rounded-xl border bg-[#0b1b54]/95 px-3 text-sm font-bold text-white outline-none transition",
        error ? "border-red-200 ring-2 ring-red-300/20" : "border-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/10",
        className,
      )}
    >
      {children}
    </select>
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cls(
        "min-h-[92px] w-full resize-y rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-white/40 focus:ring-2 focus:ring-white/10",
        className,
      )}
    />
  );
}

function EstadoButton({ active, children, onClick, tone }) {
  const activeClass = {
    ok: "border-emerald-300/40 bg-emerald-400/20 text-emerald-100",
    observacion: "border-amber-300/40 bg-amber-400/20 text-amber-100",
    na: "border-slate-300/40 bg-slate-400/20 text-slate-100",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cls(
        "h-9 rounded-xl border px-3 text-xs font-black transition",
        active ? activeClass : "border-white/10 bg-white/10 text-white/55 hover:bg-white/20",
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

      if (!next[itemId].estado && !next[itemId].comentario) {
        delete next[itemId];
      }

      return next;
    });
  }

  function setComentario(itemId, comentario) {
    onChange((prev) => {
      const actual = prev[itemId] || { estado: "", comentario: "" };
      const next = { ...prev, [itemId]: { ...actual, comentario } };

      if (!next[itemId].estado && !next[itemId].comentario) {
        delete next[itemId];
      }

      return next;
    });
  }

  function marcarSeccion(items, estado) {
    onChange((prev) => {
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

  return (
    <div className="space-y-3">
      {CHECKLIST_VOLVO.map((section) => (
        <section key={section.titulo} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
          <div className="flex flex-col gap-2 border-b border-white/10 bg-white/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-black text-white">{section.titulo}</h3>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => marcarSeccion(section.items, "ok")}
                className="rounded-xl border border-emerald-300/30 bg-emerald-400/15 px-3 py-1.5 text-xs font-black text-emerald-100"
              >
                Todo OK
              </button>

              <button
                type="button"
                onClick={() => marcarSeccion(section.items, "na")}
                className="rounded-xl border border-slate-300/30 bg-slate-400/15 px-3 py-1.5 text-xs font-black text-slate-100"
              >
                Todo N/A
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {section.items.map(([itemId, description]) => {
              const current = checklist[itemId] || { estado: "", comentario: "" };
              const mostrarComentario = current.estado === "observacion";

              return (
                <div key={itemId} className="grid gap-3 p-3 lg:grid-cols-[1fr_310px]">
                  <div>
                    <p className="text-sm font-bold leading-snug text-white/85">{description}</p>

                    {mostrarComentario ? (
                      <input
                        value={current.comentario || ""}
                        onChange={(event) => setComentario(itemId, event.target.value)}
                        placeholder="Comentario de la observación..."
                        className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35"
                      />
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <EstadoButton active={current.estado === "ok"} tone="ok" onClick={() => setEstado(itemId, "ok")}>
                      Correcto
                    </EstadoButton>
                    <EstadoButton active={current.estado === "observacion"} tone="observacion" onClick={() => setEstado(itemId, "observacion")}>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#06122f]/60 px-4 py-5 text-center transition hover:bg-white/10">
        <Camera className="mb-2 h-7 w-7 text-white/70" />
        <span className="text-sm font-black text-white">Agregar evidencia</span>
        <span className="mt-1 text-xs font-semibold text-white/50">Fotos de carrocería, tablero, daños o pertenencias.</span>
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
            <div key={`${file.name}-${index}`} className="truncate rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white/80">
              {file.name}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

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
      setMensaje("Recepción guardada correctamente.");
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
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${fondo3})` }}
        />
        <div className="absolute inset-0 bg-[#061126]/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(44,91,187,0.28),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.12),_transparent_28%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-2 py-4 sm:px-4">
        <form
          onSubmit={submit}
          className="w-full overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-3 shadow-[0_30px_90px_-25px_rgba(0,0,0,0.65)] backdrop-blur-md sm:p-5"
        >
          <header className="mb-4 text-center">
            <span className="inline-flex rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-wide text-white">
              Automotriz R&amp;R · Volvo
            </span>

            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Recepción de vehículo
            </h1>

            <p className="mt-1 text-sm font-semibold text-white/60">
              Datos generales, checklist y evidencia fotográfica.
            </p>
          </header>

          {mensaje ? (
            <div
              className={cls(
                "mb-4 rounded-2xl border px-4 py-3 text-sm font-black",
                ok ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-100" : "border-red-300/30 bg-red-400/15 text-red-100",
              )}
            >
              {mensaje}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <aside className="space-y-4">
              <section className="rounded-3xl border border-white/10 bg-[#06122f]/70 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white/70">
                  <UserRound className="h-4 w-4" />
                  Datos generales
                </h2>

                <div className="grid gap-3">
                  <Field label="Dealer" icon={Building2}>
                    <Input value={form.agencia} disabled />
                  </Field>

                  <Field label="Cliente" icon={UserRound} error={errores.nombre}>
                    <Input
                      value={form.nombre}
                      error={errores.nombre}
                      onChange={(event) => setField("nombre", event.target.value.toUpperCase())}
                      placeholder="NOMBRE COMPLETO"
                    />
                  </Field>

                  <Field label="Teléfono" icon={Phone} error={errores.telefono}>
                    <Input
                      value={form.telefono}
                      error={errores.telefono}
                      onChange={(event) => setField("telefono", soloNumeros(event.target.value).slice(0, 12))}
                      inputMode="numeric"
                      placeholder="2711234567"
                    />
                  </Field>

                  <Field label="Correo" icon={Mail} error={errores.correo}>
                    <Input
                      type="email"
                      value={form.correo}
                      error={errores.correo}
                      onChange={(event) => setField("correo", event.target.value)}
                      placeholder="correo@dominio.com"
                    />
                  </Field>

                  <Field label="Asesor" icon={UserRound} error={errores.asesor}>
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
                  </Field>

                  <Field label="Fecha recepción" icon={ClipboardList} error={errores.fecha}>
                    <Input
                      type="datetime-local"
                      value={form.fecha_hora_recepcion}
                      error={errores.fecha}
                      onChange={(event) => setField("fecha_hora_recepcion", event.target.value)}
                    />
                  </Field>

                  <Field label="Contacto preferido" icon={MessageSquareText}>
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
                  </Field>
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-[#06122f]/70 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white/70">
                  <CarFront className="h-4 w-4" />
                  Vehículo
                </h2>

                <div className="grid gap-3">
                  <Field label="Placas" icon={CarFront}>
                    <Input
                      value={form.placas}
                      onChange={(event) => setField("placas", event.target.value.toUpperCase())}
                      placeholder="ABC123"
                    />
                  </Field>

                  <Field label="VIN" icon={ClipboardList}>
                    <Input
                      value={form.vin}
                      onChange={(event) => setField("vin", event.target.value.toUpperCase())}
                      placeholder="VIN"
                    />
                  </Field>

                  <Field label="Modelo" icon={CarFront}>
                    <Input
                      value={form.modelo}
                      onChange={(event) => setField("modelo", event.target.value)}
                      placeholder="XC60"
                    />
                  </Field>

                  <Field label="Kilometraje" icon={Gauge}>
                    <Input
                      value={form.kilometraje}
                      onChange={(event) => setField("kilometraje", soloNumeros(event.target.value))}
                      inputMode="numeric"
                      placeholder="35000"
                    />
                  </Field>

                  <Field label="Observaciones" icon={MessageSquareText}>
                    <Textarea
                      value={form.observaciones}
                      onChange={(event) => setField("observaciones", event.target.value)}
                      placeholder="Comentarios generales de recepción..."
                    />
                  </Field>

                  <EvidenciasPicker evidencias={evidencias} setEvidencias={setEvidencias} />
                </div>
              </section>
            </aside>

            <section className="rounded-3xl border border-white/10 bg-[#06122f]/70 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white/70">
                  <ClipboardList className="h-4 w-4" />
                  Checklist de recepción
                </h2>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#212721]">
                  {progress.completados}/{progress.total} completados
                </span>
              </div>

              <ChecklistCard checklist={checklist} onChange={setChecklist} />
            </section>
          </div>

          <div className="sticky bottom-2 mt-4 rounded-2xl border border-white/10 bg-[#06122f]/90 p-3 backdrop-blur-xl">
            <button
              type="submit"
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-black text-[#212721] transition hover:bg-white/90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Guardando..." : "Guardar recepción"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}