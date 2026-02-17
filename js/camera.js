// ============================================================
// camera.js — Captura automática de foto (sin UI visible)
// Abre el stream, espera estabilización, captura y cierra.
// ============================================================

const video = document.getElementById("cameraStream");
const canvas = document.getElementById("photoCanvas");

/**
 * Captura una foto automáticamente sin mostrar preview.
 * Abre la cámara → espera estabilización → captura frame → cierra stream.
 * @returns {Promise<string>} Foto en base64 (data:image/png;base64,...)
 * @throws {Error} Si no se puede acceder a la cámara
 */
export async function capturePhoto() {
    const constraints = {
        video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
        },
        audio: false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    // Esperar a que el video esté listo para reproducir
    await new Promise((resolve) => {
        video.onloadedmetadata = () => {
            video.play();
            resolve();
        };
    });

    // Esperar 800ms para que la cámara se estabilice (enfoque, exposición)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Capturar frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoBase64 = canvas.toDataURL("image/png");

    // Cerrar stream inmediatamente
    stream.getTracks().forEach((track) => track.stop());
    video.srcObject = null;

    return photoBase64;
}
