import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Bienvenida from "./pages/Bienvenida";
import CrearPublicacion from "./pages/CrearPublicacion";
import VerPublicacion from "./pages/VerPublicacion";
import Apoyanos from "./pages/Apoyanos";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Bienvenida />}
                />

                <Route
                    path="/crear/:id"
                    element={<CrearPublicacion />}
                />

                {/* Página para apoyar a la comunidad */}
                <Route
                    path="/apoyanos"
                    element={<Apoyanos />}
                />

                {/* Publicaciones */}
                <Route
                    path="/:url"
                    element={<VerPublicacion />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;