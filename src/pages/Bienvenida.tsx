import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import type { Categoria } from "../types/categoria";
import { getEmojiPorCategoria } from "../utils/emojis";

function Bienvenida() {

    const navigate = useNavigate();

    const [categorias, setCategorias] =
        useState<Categoria[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        const cargarCategorias = async () => {

            try {

                const response =
                    await api.get<Categoria[]>("/categorias/");

                setCategorias(
                    response.data.filter(
                        categoria => categoria.estado
                    )
                );

            } catch (error) {

                console.error(
                    "Error cargando categorías",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        cargarCategorias();

    }, []);

    // Precalcula el emoji de cada categoría solo cuando cambia la lista
    const categoriasConEmoji = useMemo(
        () =>
            categorias.map(categoria => ({
                categoria,
                ...getEmojiPorCategoria(categoria.nombre),
            })),
        [categorias]
    );

    const seleccionarCategoria = (
        categoria: Categoria,
        emoji: string
    ) => {

        navigate(
            `/crear/${categoria.id}`,
            {
                state: {
                    emoji
                }
            }
        );

    };

    return (

        <main className="bienvenida">

            <section className="hero">

                <div className="corazon">
                    ❤️
                </div>

                <h1>
                    Crea algo especial
                </h1>

                <p>
                    Comparte un recuerdo,
                    una dedicatoria o un momento especial.
                </p>

                <h2>
                    ¿Qué quieres crear?
                </h2>

                {loading ? (

                    <p>
                        Cargando categorías...
                    </p>

                ) : (

                    <div className="categorias">

                        {categoriasConEmoji.map(
                            ({ categoria, emoji, descripcion }) => (

                                <button
                                    key={categoria.id}
                                    className="categoria"
                                    onClick={() =>
                                        seleccionarCategoria(
                                            categoria,
                                            emoji
                                        )
                                    }
                                >

                                    <span
                                        title={descripcion}
                                        aria-label={descripcion}
                                    >
                                        {emoji}
                                    </span>

                                    {categoria.nombre}

                                </button>

                            )
                        )}

                    </div>

                )}

            </section>

        </main>
    );
}

export default Bienvenida;
