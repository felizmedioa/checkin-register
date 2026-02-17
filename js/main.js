// ============================================================
// main.js — Punto de entrada
// Importa e inicializa todos los módulos.
// ============================================================

import { initForm } from "./form.js";

// ─── Fecha y hora en el header ─────────────────────────────

function formatDateTime() {
    const now = new Date();
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];
    const anio = now.getFullYear();
    const hora = String(now.getHours()).padStart(2, "0");
    const minuto = String(now.getMinutes()).padStart(2, "0");

    return `${dia} de ${mes} del ${anio} — ${hora}:${minuto}`;
}

function updateHeaderDateTime() {
    const el = document.getElementById("headerDateTime");
    if (el) el.textContent = formatDateTime();
}

// Actualizar al cargar y cada minuto
updateHeaderDateTime();
setInterval(updateHeaderDateTime, 60000);

// ─── Inicializar formulario ────────────────────────────────
initForm();
