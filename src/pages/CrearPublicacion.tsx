import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { crearPublicacion } from "../services/publicacionService";

import { descargarImagenPublicacion } from "../utils/qr";

const API_URL = import.meta.env.VITE_API_URL;

// Emoji por defecto si se entra directo a esta ruta sin pasar por Bienvenida
const EMOJI_DEFAULT = "❤️";



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
                            📥 Descargar QR de Publicacion
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
                            placeholder="Título ..."
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


                        <label className="upload-box">
    <input
        type="file"
        accept="image/*"
        multiple
        onChange={seleccionarFotos}
    />

    <div className="upload-content">
        <span className="upload-icon">📸</span>

        <strong>Selecciona tus fotos</strong>

        <span>
            Haz clic aquí para subir imágenes
        </span>

        <small>
            Puedes seleccionar varias fotos
        </small>
    </div>
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
