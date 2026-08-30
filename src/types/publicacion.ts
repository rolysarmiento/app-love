export interface Publicacion {
    id: number;
    url: string;
    titulo: string;
    id_categoria: number;
    comentarios: string | null;
    fecha_creacion: string;
    estado: boolean;
}

export interface PublicacionCreate {
    url: string;
    titulo: string;
    id_categoria: number;
    comentarios?: string;
    estado?: boolean;
}

export interface PublicacionUpdate {
    url?: string;
    titulo?: string;
    id_categoria?: number;
    comentarios?: string;
    estado?: boolean;
}