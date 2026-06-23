import type { Id3Tags } from '../types/song';

export function parseFilename(filename: string): { artist: string | null; title: string } {
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const match = baseName.match(/^(.+?)\s+-\s+(.+)$/);

  return match
    ? { artist: match[1].trim(), title: match[2].trim() }
    : { artist: null, title: baseName };
}

export function resolveMetadata(filename: string, tags: Id3Tags): { artist: string; title: string } {
  const { artist: filenameArtist, title: filenameTitle } = parseFilename(filename);

  if (filenameArtist) {
    const id3TitleIsRedundant =
      Boolean(tags.title) &&
      tags.title!.toLowerCase().startsWith(filenameArtist.toLowerCase() + ' - ');

    return {
      artist: filenameArtist,
      title: !id3TitleIsRedundant && tags.title ? tags.title : filenameTitle,
    };
  }

  return {
    artist: tags.artist || 'Artista desconocido',
    title: tags.title || filenameTitle,
  };
}

