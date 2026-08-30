export interface Foto {
    id: number;
    id_publicacion: number;
    foto: string;
    estado: boolean;
}

export interface FotoCreate {
    id_publicacion: number;
    foto: string;
    estado?: boolean;
}

export interface FotoUpdate {
    foto?: string;
    estado?: boolean;
}