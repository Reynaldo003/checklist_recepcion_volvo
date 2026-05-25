// src/lib/apiRecepcionVolvo.js
import { abrirBlobEnNuevaPestana, http, httpBlob, toQuery } from "./apiClient";

const BASE = "/recepcion-volvo/api/recepciones";

function esArchivo(value) {
  return typeof File !== "undefined" && value instanceof File;
}

function esBlob(value) {
  return typeof Blob !== "undefined" && value instanceof Blob;
}

function agregarCampo(fd, key, value) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value === "boolean") {
    fd.append(key, value ? "true" : "false");
    return;
  }

  fd.append(key, String(value));
}

function agregarJson(fd, key, value, defaultValue) {
  const finalValue =
    value === undefined || value === null ? defaultValue : value;
  fd.append(key, JSON.stringify(finalValue));
}

function agregarArchivos(fd, archivos = []) {
  if (!Array.isArray(archivos)) {
    return;
  }

  archivos.forEach((archivo) => {
    if (esArchivo(archivo) || esBlob(archivo)) {
      fd.append("evidencias_nuevas", archivo);
    }
  });
}

function agregarDeleteIds(fd, ids = []) {
  if (!Array.isArray(ids)) {
    return;
  }

  ids.forEach((id) => {
    if (id !== undefined && id !== null && id !== "") {
      fd.append("delete_evidencia_ids", String(id));
    }
  });
}

function buildRecepcionFormData(payload = {}) {
  const fd = new FormData();

  agregarCampo(fd, "cliente_id", payload.cliente_id);
  agregarCampo(fd, "nombre", payload.nombre);
  agregarCampo(fd, "telefono", payload.telefono);
  agregarCampo(fd, "correo", payload.correo);

  agregarCampo(fd, "agencia", payload.agencia || "Volvo");
  agregarCampo(fd, "asesor_servicio", payload.asesor_servicio);

  agregarCampo(fd, "placas", payload.placas);
  agregarCampo(fd, "vin", payload.vin);
  agregarCampo(fd, "modelo", payload.modelo);
  agregarCampo(fd, "kilometraje", payload.kilometraje);

  agregarCampo(fd, "fecha_hora_recepcion", payload.fecha_hora_recepcion);
  agregarCampo(
    fd,
    "metodo_contacto_preferido",
    payload.metodo_contacto_preferido || "whatsapp",
  );

  agregarCampo(fd, "observaciones", payload.observaciones);

  agregarJson(
    fd,
    "checklist_json",
    payload.checklist_json || payload.checklist,
    {},
  );
  agregarJson(
    fd,
    "evidencias_existentes_json",
    payload.evidencias_existentes_json || payload.evidencias_existentes,
    [],
  );

  agregarDeleteIds(fd, payload.delete_evidencia_ids);
  agregarArchivos(fd, payload.evidencias_nuevas || payload.evidencias);

  return fd;
}

export const apiRecepcionVolvo = {
  list: (params = {}) => http(`${BASE}/${toQuery(params)}`),

  get: (id) => http(`${BASE}/${id}/`),

  create: (payload) =>
    http(`${BASE}/`, {
      method: "POST",
      body: buildRecepcionFormData(payload),
    }),

  update: (id, payload) =>
    http(`${BASE}/${id}/`, {
      method: "PUT",
      body: buildRecepcionFormData(payload),
    }),

  patch: (id, payload) =>
    http(`${BASE}/${id}/`, {
      method: "PATCH",
      body: buildRecepcionFormData(payload),
    }),

  remove: (id) =>
    http(`${BASE}/${id}/`, {
      method: "DELETE",
    }),

  terminar: (id) =>
    http(`${BASE}/${id}/terminar/`, {
      method: "PATCH",
    }),

  checklistPdf: (id) => httpBlob(`${BASE}/${id}/checklist-pdf/`),

  abrirChecklistPdf: async (id) => {
    const blob = await httpBlob(`${BASE}/${id}/checklist-pdf/`);
    abrirBlobEnNuevaPestana(blob);
    return blob;
  },

  buildFormData: buildRecepcionFormData,
};
