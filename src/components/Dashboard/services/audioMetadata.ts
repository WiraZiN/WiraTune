import { AUDIO_METADATA_TIMEOUT_MS } from '../constants';
import type { Id3Tags } from '../types/song';

export function readAudioDuration(file: File): Promise<number> {
  return new Promise(resolve => {
    const audio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);

    const finish = (duration: number) => {
      URL.revokeObjectURL(objectUrl);
      audio.src = '';
      resolve(Number.isFinite(duration) && duration > 0 ? duration : 0);
    };

    audio.preload = 'metadata';
    audio.src = objectUrl;
    audio.onloadedmetadata = () => finish(audio.duration);
    audio.onerror = () => finish(0);
    setTimeout(() => finish(audio.duration || 0), AUDIO_METADATA_TIMEOUT_MS);
  });
}

export function readId3Tags(file: File): Promise<Id3Tags> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onerror = () => resolve({});
    reader.onload = event => {
      try {
        resolve(parseId3Buffer(event.target!.result as ArrayBuffer));
      } catch {
        resolve({});
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
}

function parseId3Buffer(buffer: ArrayBuffer): Id3Tags {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return {};

  const version = bytes[3];
  const tagSize =
    ((bytes[6] & 0x7f) << 21) |
    ((bytes[7] & 0x7f) << 14) |
    ((bytes[8] & 0x7f) << 7) |
    (bytes[9] & 0x7f);
  const tags: Id3Tags = {};
  let offset = 10;

  while (offset < tagSize + 10 && offset + 10 < buffer.byteLength) {
    const frameId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    );
    if (!/^[A-Z0-9]{4}$/.test(frameId)) break;

    const frameSize =
      version >= 4
        ? ((bytes[offset + 4] & 0x7f) << 21) |
          ((bytes[offset + 5] & 0x7f) << 14) |
          ((bytes[offset + 6] & 0x7f) << 7) |
          (bytes[offset + 7] & 0x7f)
        : view.getUint32(offset + 4);

    if (frameSize <= 0 || frameSize > tagSize || offset + 10 + frameSize > buffer.byteLength) break;

    if (frameId === 'TIT2' || frameId === 'TPE1') {
      const text = decodeId3FrameText(buffer, offset, frameSize);
      if (text) {
        if (frameId === 'TIT2') tags.title = text;
        else tags.artist = text;
      }
    }
    offset += 10 + frameSize;
  }

  return tags;
}

function decodeId3FrameText(buffer: ArrayBuffer, frameOffset: number, frameSize: number): string {
  const encoding = new Uint8Array(buffer)[frameOffset + 10];
  const rawBytes = new Uint8Array(buffer, frameOffset + 11, frameSize - 1);

  try {
    const decoded =
      encoding === 0
        ? new TextDecoder('iso-8859-1').decode(rawBytes)
        : encoding === 1 || encoding === 2
          ? new TextDecoder('utf-16').decode(rawBytes)
          : new TextDecoder('utf-8').decode(rawBytes);
    return decoded.replace(/\0/g, '').trim();
  } catch {
    return '';
  }
}

