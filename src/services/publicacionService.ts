import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export interface PublicacionCreate {
    url: string;
    titulo: string;
    id_categoria: number;
    comentarios?: string;
    estado?: boolean;
}

export interface PublicacionResponse {
    id: number;
    url: string;
    titulo: string;
    id_categoria: number;
    comentarios: string | null;
    fecha_creacion: string;
    estado: boolean;
}

export const crearPublicacion = async (
    datos: PublicacionCreate
): Promise<PublicacionResponse> => {

    const response = await axios.post<PublicacionResponse>(
        `${API_URL}/publicaciones/`,
        datos
    );

    return response.data;
};