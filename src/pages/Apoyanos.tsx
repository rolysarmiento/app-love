import { useNavigate } from "react-router-dom";
import "./Apoyanos.css";

const Apoyanos = () => {
    const navigate = useNavigate();

    return (
        <div className="apoyanos-page">

            <div className="apoyanos-card">

         

                <h1>Apoya a App Love</h1>

                <p className="apoyanos-principal">
                    Ayúdanos a mantener esta comunidad
                    gratuita y seguir compartiendo
                    momentos especiales. 🥰
                </p>

                <div className="yape-container">
                    <img
                        src="/yape.jpeg"
                        alt="QR de Yape"
                        className="yape-qr"
                    />
                </div>

                <p className="yape-instruccion">
                    📱 Escanea el código con Yape
                </p>

                <div className="yape-numero">
                    <span>Yape</span>
                    <strong>999 369 309</strong>
                </div>

                <p className="apoyanos-mensaje">
                    Cada pequeño aporte nos ayuda a mantener
                    App Love funcionando y las publicaciones
                    disponibles por más tiempo. 
                </p>

                <button
                    className="btn-volver"
                    onClick={() => navigate(-1)}
                >
                    ← Volver
                </button>

            </div>

            {/* <div className="apoyanos-footer">
                Hecho con ❤️ para compartir momentos especiales
            </div> */}

            <div className="copyright">
                © {new Date().getFullYear()} RyS Solutions Technology
            </div>

        </div>
    );
};

export default Apoyanos;