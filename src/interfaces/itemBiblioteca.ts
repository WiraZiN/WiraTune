export interface ItemBiblioteca {
  id: number;
  nombre: string;
  tipo: string;
  fechaAgregado: Date;
  artista?: string;
  imagen?: string;
  file?: File;
  title?: string;
  dur?: number;
  durFmt?: string;
}
