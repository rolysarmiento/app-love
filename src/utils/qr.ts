import QRCode from "qrcode";

function wrapText(
    ctx: CanvasRenderingContext2D,
    texto: string,
    maxWidth: number
): string[] {
    const palabras = texto.split(" ");
    const lineas: string[] = [];
    let lineaActual = "";

    palabras.forEach((palabra) => {
        const lineaPrueba = lineaActual
            ? `${lineaActual} ${palabra}`
            : palabra;

        if (
            ctx.measureText(lineaPrueba).width > maxWidth &&
            lineaActual
        ) {
            lineas.push(lineaActual);
            lineaActual = palabra;
        } else {
            lineaActual = lineaPrueba;
        }
    });

    if (lineaActual) {
        lineas.push(lineaActual);
    }

    return lineas;
}


export async function descargarImagenPublicacion(
    emoji: string,
    titulo: string,
    url: string
) {

    // ==========================================
    // GENERAR QR
    // ==========================================

    const qrDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 1,
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
    });

    const qrImg = new Image();
    qrImg.src = qrDataUrl;

    await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve();
    });


    // ==========================================
    // CANVAS
    // ==========================================

    const canvas = document.createElement("canvas");

    const ancho = 600;
    const alto = 780;

    canvas.width = ancho;
    canvas.height = alto;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return;
    }


    // ==========================================
    // FONDO
    // ==========================================

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        ancho,
        alto
    );


    ctx.textAlign = "center";


    // ==========================================
    // EMOJI
    // ==========================================

    ctx.font = "100px sans-serif";

    ctx.fillText(
        emoji,
        ancho / 2,
        140
    );


    // ==========================================
    // TITULO
    // ==========================================

    ctx.font = "bold 40px sans-serif";

    ctx.fillStyle = "#222222";

    const lineas = wrapText(
        ctx,
        titulo,
        ancho - 80
    );

    let y = 220;

    lineas.forEach((linea) => {

        ctx.fillText(
            linea,
            ancho / 2,
            y
        );

        y += 50;

    });


    // ==========================================
    // QR
    // ==========================================

    const qrSize = 350;

    const qrY = y + 30;

    ctx.drawImage(
        qrImg,
        (ancho - qrSize) / 2,
        qrY,
        qrSize,
        qrSize
    );


    // ==========================================
    // TEXTO
    // ==========================================

    ctx.font = "20px sans-serif";

    ctx.fillStyle = "#666666";

    ctx.fillText(
        "Escanea para ver la publicación ❤️",
        ancho / 2,
        qrY + qrSize + 40
    );


    // ==========================================
    // DESCARGAR
    // ==========================================

    const link = document.createElement("a");

    link.download = "publicacion-qr.png";

    link.href = canvas.toDataURL(
        "image/png"
    );

    link.click();
}