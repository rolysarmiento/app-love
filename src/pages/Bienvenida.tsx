import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import type { Categoria } from "../types/Categoria";

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

    const seleccionarCategoria = (
        categoria: Categoria
    ) => {

        navigate(
            `/crear/${categoria.id}`
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

                        {categorias.map(
                            categoria => (

                                <button
                                    key={categoria.id}
                                    className="categoria"
                                    onClick={() =>
                                        seleccionarCategoria(
                                            categoria
                                        )
                                    }
                                >

                                    <span>
                                        ❤️
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