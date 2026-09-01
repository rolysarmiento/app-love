import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { crearPublicacion } from "../services/publicacionService";
import QRCode from "qrcode";

const API_URL = import.meta.env.VITE_API_URL;

// Emoji por defecto si se entra directo a esta ruta sin pasar por Bienvenida
const EMOJI_DEFAULT = "❤️";

// ==========================================
// Corta el texto en varias líneas si es muy largo para el ancho del canvas
// ==========================================
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

        if (ctx.measureText(lineaPrueba).width > maxWidth && lineaActual) {
            lineas.push(lineaActual);
            lineaActual = palabra;
        } else {
            lineaActual = lineaPrueba;
        }
    });

    if (lineaActual) lineas.push(lineaActual);

    return lineas;
}

// ==========================================
// Genera y descarga la imagen con emoji + título + QR
// ==========================================
async function descargarImagenPublicacion(
    emoji: string,
    titulo: string,
    url: string
) {

    // 1. Genera el QR como imagen
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
    await new Promise((resolve) => (qrImg.onload = resolve));

    // 2. Prepara el canvas
    const canvas = document.createElement("canvas");
    const ancho = 600;
    const alto = 780;
    canvas.width = ancho;
    canvas.height = alto;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fondo
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ancho, alto);

    ctx.textAlign = "center";

    // Emoji grande arriba
    ctx.font = "100px sans-serif";
    ctx.fillText(emoji, ancho / 2, 140);

    // Título (con salto de línea automático si es largo)
    ctx.font = "bold 40px sans-serif";
    ctx.fillStyle = "#222222";

    const lineas = wrapText(ctx, titulo, ancho - 80);
    let y = 220;

    lineas.forEach((linea) => {
        ctx.fillText(linea, ancho / 2, y);
        y += 50;
    });

    // QR debajo del título
    const qrSize = 350;
    const qrY = y + 30;

    ctx.drawImage(
        qrImg,
        (ancho - qrSize) / 2,
        qrY,
        qrSize,
        qrSize
    );

    // Texto pequeño bajo el QR
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#666666";
    ctx.fillText(
        "", //algun comentario debajo de la img
        ancho / 2,
        qrY + qrSize + 40
    );

    // 3. Descarga la imagen generada
    const link = document.createElement("a");
    link.download = "publicacion.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}


function CrearPublicacion() {

    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Emoji recibido desde Bienvenida (navigate state), con fallback por defecto
    const emoji: string =
        (location.state as { emoji?: string } | null)?.emoji
        ?? EMOJI_DEFAULT;

    const [titulo, setTitulo] = useState("");
    const [url, setUrl] = useState("");
    const [comentario, setComentario] = useState("");

    const [fotos, setFotos] = useState<File[]>([]);
    const [guardando, setGuardando] = useState(false);

    const [urlPublicacion, setUrlPublicacion] = useState("");

    const seleccionarFotos = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!event.target.files) {
            return;
        }
        const nuevasFotos = Array.from(
            event.target.files
        );
        if (fotos.length + nuevasFotos.length > 3) {
            alert(
                "Solo puedes subir un máximo de 3 fotos."
            );
            return;
        }
        setFotos([
            ...fotos,
            ...nuevasFotos
        ]);
    };

    const eliminarFoto = (index: number) => {
        setFotos(
            fotos.filter(
                (_, i) => i !== index
            )
        );
    };

    // ==========================================
    // GENERAR URL
    // ==========================================
    const generarUrl = (texto: string) => {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const guardar = async () => {
        if (!titulo.trim()) {
            alert("Ingresa el título.");
            return;
        }
        if (!comentario.trim()) {
            alert("Ingresa un comentario.");
            return;
        }
        if (fotos.length === 0) {
            alert("Debes subir al menos una foto.");
            return;
        }
        if (!id) {
            alert("No se encontró la categoría.");
            return;
        }

        let idPublicacionCreada: number | null = null;

        try {
            setGuardando(true);

            // ==========================================
            // 1. GENERAR URL
            // ==========================================
            const urlGenerada = url.trim()
                ? generarUrl(url)
                : generarUrl(titulo);

            const datos = {
                url: urlGenerada,
                titulo: titulo.trim(),
                id_categoria: Number(id),
                comentarios: comentario.trim(),
                estado: true
            };

            console.log("Enviando publicación:", datos);

            // ==========================================
            // 2. CREAR PUBLICACIÓN
            // ==========================================
            const respuesta = await crearPublicacion(datos);
            console.log(
                "Publicación creada:",
                respuesta
            );

            idPublicacionCreada = respuesta.id;

            // ==========================================
            // 3. SUBIR FOTOS
            // ==========================================
            console.log("Subiendo fotos...");

            for (const foto of fotos) {
                const formData = new FormData();
                formData.append(
                    "id_publicacion",
                    idPublicacionCreada.toString()
                );
                formData.append(
                    "foto",
                    foto
                );
                await axios.post(
                    `${API_URL}/fotos/`,
                    formData
                );
            }

            console.log(
                "Fotos subidas correctamente."
            );

            // ==========================================
            // 4. GENERAR URL FINAL
            // ==========================================
            const urlFinal =
                `${window.location.origin}/${respuesta.url}`;

            setUrlPublicacion(urlFinal);

            alert(
                "¡Publicación creada correctamente! ❤️"
            );

        } catch (error: any) {
            console.error(
                "Error creando publicación:",
                error
            );

            // ==========================================
            // SI LA PUBLICACIÓN YA FUE CREADA
            // PERO FALLÓ UNA FOTO
            // ==========================================
            if (idPublicacionCreada !== null) {
                console.log(
                    "Eliminando publicación incompleta:",
                    idPublicacionCreada
                );
                try {
                    await axios.delete(
                        `${API_URL}/publicaciones/${idPublicacionCreada}`
                    );
                    console.log(
                        "Publicación incompleta eliminada correctamente."
                    );
                } catch (deleteError) {
                    console.error(
                        "No se pudo eliminar la publicación incompleta:",
                        deleteError
                    );
                }
            }

            // ==========================================
            // ERROR DE URL DUPLICADA
            // ==========================================
            if (
                error.response &&
                error.response.status === 409
            ) {
                alert(
                    error.response.data?.detail ||
                    "La URL ya está registrada. Elige otra."
                );
                return;
            }

            // ==========================================
            // OTROS ERRORES
            // ==========================================
            if (
                error.response &&
                error.response.data
            ) {
                alert(
                    error.response.data.detail ||
                    "No se pudo crear la publicación."
                );
                return;
            }

            alert(
                "No se pudo conectar con el servidor."
            );

        } finally {
            setGuardando(false);
        }
    };

    // ==========================================
    // PUBLICACIÓN CREADA
    // ==========================================

    if (urlPublicacion) {

        return (

            <main className="crear">

                <section className="crear-contenido">

                    <div className="crear-header">

                        <div className="crear-icono">
                            {emoji}
                        </div>

                        <h1>
                            ¡Publicación creada!
                        </h1>

                        <p>
                            Tu publicación se guardó
                            correctamente.
                        </p>

                    </div>


                    <div className="formulario">

                        <div className="campo">

                            <label>
                                Link de tu publicación
                            </label>

                            <div className="url-input">

                                <input
                                    type="text"
                                    value={urlPublicacion}
                                    readOnly
                                />

                            </div>

                        </div>


                        <button
                            className="btn-guardar"
                            onClick={() =>
                                window.open(
                                    urlPublicacion
                                )
                            }
                        >
                            {emoji} Ver publicación
                        </button>


                        <button
                            className="btn-guardar"
                            onClick={() =>
                                descargarImagenPublicacion(
                                    emoji,
                                    'Tengo algo para Ti.',
                                    urlPublicacion
                                )
                            }
                        >
                            📥 Descargar imagen
                        </button>


                        <button
                            className="volver"
                            onClick={() =>
                                navigate("/")
                            }
                        >
                            ← Crear otra publicación
                        </button>

                    </div>

                </section>

            </main>

        );

    }


    // ==========================================
    // FORMULARIO
    // ==========================================

    return (

        <main className="crear">

            <section className="crear-contenido">

                <button
                    className="volver"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Volver
                </button>


                <div className="crear-header">

                    <div className="crear-icono">
                        {emoji}
                    </div>

                    <h1>
                        Crear publicación
                    </h1>

                    <p>
                        Crea algo especial para compartir.
                    </p>

                </div>


                <div className="formulario">


                    {/* TÍTULO */}

                    <div className="campo">

                        <label>
                            Título
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. Para el amor de mi vida"
                            value={titulo}
                            onChange={(e) =>
                                setTitulo(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* URL */}

                    <div className="campo">

                        <label>
                            URL de tu publicación
                        </label>

                        <div className="url-input">

                            <span>
                                Ej: www.app-love.com/Nick
                            </span>

                            <input
                                type="text"
                                placeholder="Nick"
                                value={url}
                                onChange={(e) =>
                                    setUrl(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                        <small>
                            Si la dejas vacía,
                            se generará automáticamente
                            desde el título.
                        </small>

                    </div>


                    {/* COMENTARIO */}

                    <div className="campo">

                        <label>
                            Comentario
                        </label>

                        <textarea
                            rows={6}
                            placeholder="Escribe tu mensaje..."
                            value={comentario}
                            onChange={(e) =>
                                setComentario(
                                    e.target.value
                                )
                            }
                        />

                    </div>


                    {/* FOTOS */}

                    <div className="campo">

                        <label>
                            Fotos
                        </label>

                        <small>
                            Puedes subir hasta 3 fotos.
                        </small>


                        <label
                            className="subir-fotos"
                        >

                            <span>
                                📷
                            </span>

                            <strong>
                                Seleccionar fotos
                            </strong>

                            <small>
                                JPG, PNG o WEBP
                            </small>

                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={
                                    seleccionarFotos
                                }
                            />

                        </label>


                        {/* PREVISUALIZACIÓN */}

                        {fotos.length > 0 && (

                            <div className="fotos-preview">

                                {fotos.map(
                                    (foto, index) => (

                                        <div
                                            className="foto-preview"
                                            key={index}
                                        >

                                            <img
                                                src={
                                                    URL.createObjectURL(
                                                        foto
                                                    )
                                                }
                                                alt={`Foto ${index + 1}`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    eliminarFoto(
                                                        index
                                                    )
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* GUARDAR */}

                    <button
                        className="btn-guardar"
                        onClick={guardar}
                        disabled={guardando}
                    >

                        {guardando
                            ? "Guardando publicación..."
                            : `${emoji} Crear publicación`
                        }

                    </button>


                </div>

            </section>

        </main>
    );
}

export default CrearPublicacion;
