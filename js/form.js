// form.js — Lógica del formulario de asistencia
// Carga trabajadoras desde workers.json, auto-rellena DNI y envía datos.

import { capturePhoto } from "./camera.js";
import { getLocation } from "./location.js";

const LOCAL_KEY = "victoria-vestidos";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwVbYclc_-cser7_SCNPi6EQK-BaYqVBlKqh_M8O8w4ClwGAanEYnSkqSETf86-lyf0tg/exec";

let localData = null;
let trabajadoras = [];

// Extrae las trabajadoras del objeto del local
function parseTrabajadoras(data) {
    const result = [];
    for (const key of Object.keys(data)) {
        if (key.startsWith("trabajadora")) {
            result.push({ nombre: data[key].nombre, dni: data[key].dni });
        }
    }
    return result;
}

// Puebla el select de trabajadoras
function populateSelect(selectEl, lista) {
    lista.forEach((info, pos) => {
        const option = document.createElement("option");
        option.value = pos;
        option.textContent = info.nombre;
        selectEl.appendChild(option);
    });
}

//Auto selecciona un registro de entrada/salida
function selectRegistro(registroEl, hour) {
    let option = registroEl.options;
    if(hour <= 12 && hour >= 0) {
        option[1].selected = true;
    } else if(hour > 12 && hour <= 23) {
        option[2].selected = true;
    }
}

// Inicializa el formulario
export async function initForm() {
    const selectEl = document.getElementById("trabajadora");
    const dniEl = document.getElementById("dni");
    const rucEl = document.getElementById("companyRuc");
    const form = document.getElementById("attendanceForm");
    const btn = document.getElementById("btnSubmit");
    const statusEl = document.getElementById("submitStatus");
    const registroEl = document.getElementById("registro");

    // Cargar datos del local
    try {
        const res = await fetch("./data/workers.json");
        const json = await res.json();
        localData = json[LOCAL_KEY];

        if (!localData) {
            showStatus(statusEl, `Local "${LOCAL_KEY}" no encontrado.`, "error");
            return;
        }

        // Mostrar RUC en el header
        rucEl.textContent = `RUC: ${localData.ruc}`;


        
        // Obtener trabajadoras y poblar select
        trabajadoras = parseTrabajadoras(localData);
        populateSelect(selectEl, trabajadoras);

        

    } catch (err) {
        showStatus(statusEl, "Error al cargar datos de trabajadoras.", "error");
        return;
    }

    // Auto-rellenar DNI al elegir trabajadora
    selectEl.addEventListener("change", () => {
        const idx = selectEl.value;
        dniEl.value = idx !== "" ? trabajadoras[idx].dni : "";
    });


    //Auto selecciona un registro de entrada/salida
    const hour = new Date().getHours();
    selectRegistro(registroEl, hour);

    // Envío del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validar selección
        if (selectEl.value === "") {
            showStatus(statusEl, "Selecciona una trabajadora.", "error");
            return;
        }

        let evento = registroEl.value;

        const selected = trabajadoras[selectEl.value];
        setLoading(btn, true);
        showStatus(statusEl, "Obteniendo ubicación…", "info");

        try {
            const ubicacion = await getLocation();

            showStatus(statusEl, "Capturando foto…", "info");
            const foto = await capturePhoto();

            const fechaHora = new Date().toISOString();

            const payload = {
                local: localData.nombrejuridico,
                nombrecompleto: selected.nombre,
                dni: selected.dni,
                evento,
                ubicacion,
                foto,
                fechaHora,
            };

            showStatus(statusEl, "Enviando registro…", "info");

            const res = await fetch(APPS_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const result = await res.json();

            if (result.success) {
                showStatus(statusEl, "✓ Asistencia registrada.", "success");
                showToast(selected.nombre, fechaHora);
                form.reset();
                dniEl.value = "";
            } else {
                showStatus(statusEl, result.message || "Error al registrar.", "error");
            }
        } catch (err) {
            showStatus(statusEl, `Error: ${err.message}`, "error");
        } finally {
            setLoading(btn, false);
        }
    });
}

// — Helpers —

function showStatus(el, msg, type) {
    el.textContent = msg;
    el.className = `submit-status ${type}`;
}

function setLoading(btn, loading) {
    if (loading) {
        btn.disabled = true;
        btn.classList.add("loading");
        btn.innerHTML = `<span class="spinner"></span> Procesando…`;
    } else {
        btn.disabled = false;
        btn.classList.remove("loading");
        btn.textContent = "Registrar Asistencia";
    }
}

function showToast(nombre, fechaHora) {
    const toast = document.getElementById("toast");
    const fecha = new Date(fechaHora);
    const hora = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    toast.innerHTML = `
        <div class="toast-title">Registro exitoso</div>
        <div>${nombre}</div>
        <div class="toast-datetime">${hora}</div>
    `;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 4000);
}
