import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./VerPublicacion.css";

const API_URL = import.meta.env.VITE_API_URL;

interface Foto {
    id: number;
    foto: string;
    estado: boolean;
}

interface Publicacion {
    id: number;
    url: string;
    titulo: string;
    id_categoria: number;
    comentarios: string | null;
    fecha_creacion: string;
    estado: boolean;
    fotos: Foto[];
}

function VerPublicacion() {
    const { url } = useParams<{ url: string }>();
    const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    
    const navigate = useNavigate();

    // Estados adicionales para la UI
    const [fotoActualIndex, setFotoActualIndex] = useState(0);
    const [sobreAbierto, setSobreAbierto] = useState(false);

    useEffect(() => {
        const cargarPublicacion = async () => {
            if (!url) {
                setError("Publicación no encontrada.");
                setCargando(false);
                return;
            }

            try {
                const respuesta = await axios.get(
                    `${API_URL}/publicaciones/${encodeURIComponent(url)}`
                );
                setPublicacion(respuesta.data);
            } catch (error: any) {
                console.error("Error cargando publicación:", error);
                if (error.response?.status === 404) {
                    setError("Esta publicación no existe.");
                } else {
                    setError("No se pudo cargar la publicación.");
                }
            } finally {
                setCargando(false);
            }
        };

        cargarPublicacion();
    }, [url]);

    if (cargando) {
        return (
            <main className="publicacion">
                <div className="publicacion-cargando">
                    <div className="corazon">❤️</div>
                    <p>Cargando publicación...</p>
                </div>
            </main>
        );
    }

    if (error || !publicacion) {
        return (
            <main className="publicacion">
                <div className="publicacion-error">
                    <div className="corazon">💔</div>
                    <h1>Publicación no encontrada</h1>
                    <p>{error}</p>
                </div>
            </main>
        );
    }

    const fotosActivas = publicacion.fotos?.filter((f) => f.estado) || [];

    const siguienteFoto = () => {
        setFotoActualIndex((prev) => (prev + 1) % fotosActivas.length);
    };

    const anteriorFoto = () => {
        setFotoActualIndex((prev) =>
            prev === 0 ? fotosActivas.length - 1 : prev - 1
        );
    };

    return (
        <main className="publicacion">
            <section className="publicacion-contenido">

                <button
                    className="volver"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    ← Volver
                </button>


                {/* 1. TÍTULO */}
                <h1 className="publicacion-titulo">{publicacion.titulo}</h1>

                {/* 2. CARRUSEL DE FOTOS AL CENTRO */}
                {fotosActivas.length > 0 && (
                    <div className="carrusel-contenedor">
                        <div className="carrusel-marco">
                            <img
                                src={`${API_URL}${fotosActivas[fotoActualIndex].foto}`}
                                alt={publicacion.titulo}
                                className="carrusel-imagen"
                            />
                            {fotosActivas.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        className="carrusel-btn prev"
                                        onClick={anteriorFoto}
                                    >
                                        &#10094;
                                    </button>
                                    <button
                                        type="button"
                                        className="carrusel-btn next"
                                        onClick={siguienteFoto}
                                    >
                                        &#10095;
                                    </button>
                                </>
                            )}
                        </div>
                        {fotosActivas.length > 1 && (
                            <div className="carrusel-indicadores">
                                {fotosActivas.map((foto, idx) => (
                                    <span
                                        key={foto.id}
                                        className={`indicador ${
                                            idx === fotoActualIndex ? "activo" : ""
                                        }`}
                                        onClick={() => setFotoActualIndex(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. SOBRE Y CARTA AL FINAL */}
                {publicacion.comentarios && (
                    <div className="sobre-contenedor">
                        <div
                            className={`sobre ${sobreAbierto ? "abierto" : ""}`}
                            onClick={() => setSobreAbierto(!sobreAbierto)}
                        >
                            <div className="solapa"></div>
                            <div className="sobre-cuerpo">
                                {!sobreAbierto && (
                                    <span className="sobre-mensaje">
                                        Abrir la carta ✉️
                                    </span>
                                )}
                            </div>
                            <div className="carta">
                                <p className="carta-texto">
                                    {publicacion.comentarios}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

export default VerPublicacion;