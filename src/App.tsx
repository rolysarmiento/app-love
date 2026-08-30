import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Bienvenida from "./pages/Bienvenida";
import CrearPublicacion from "./pages/CrearPublicacion";
import VerPublicacion from "./pages/VerPublicacion";

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

                <Route
                    path="/:url"
                    element={<VerPublicacion />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;