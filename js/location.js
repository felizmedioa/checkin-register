// ============================================================
// location.js — Obtención de ubicación (sin mapa visible)
// Retorna las coordenadas como una Promesa.
// ============================================================

/**
 * Obtiene la ubicación actual del dispositivo.
 * @returns {Promise<{lat: number, lng: number}>} Coordenadas
 * @throws {Error} Si la geolocalización falla o no está soportada
 */
export function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocalización no soportada en este navegador."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                const messages = {
                    1: "Permiso de ubicación denegado.",
                    2: "Ubicación no disponible.",
                    3: "Tiempo de espera agotado.",
                };
                reject(new Error(messages[error.code] || "Error al obtener ubicación."));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}
