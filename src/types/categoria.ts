export interface Categoria {
    id: number;
    nombre: string;
    estado: boolean;
}

export interface CategoriaCreate {
    nombre: string;
    estado?: boolean;
}

export interface CategoriaUpdate {
    nombre?: string;
    estado?: boolean;
}