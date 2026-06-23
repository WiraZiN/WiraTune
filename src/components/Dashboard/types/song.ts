export interface Song {
  id: number;
  file: File;
  title: string;
  artist: string;
  dur: number;
  durFmt: string;
  date: Date;
  isFav: boolean;
}

export interface Id3Tags {
  title?: string;
  artist?: string;
}

