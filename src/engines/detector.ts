import type { FileType, ImageSubtype, DetectedFile } from './types';

const MAGIC_BYTES: Array<{
  bytes: number[];
  offset?: number;
  type: FileType;
  imageSubtype?: ImageSubtype;
  extraCheck?: (view: DataView) => boolean;
}> = [
  // PDF: %PDF-
  { bytes: [0x25, 0x50, 0x44, 0x46, 0x2d], type: 'pdf' },
  // JPEG: FF D8 FF
  { bytes: [0xff, 0xd8, 0xff], type: 'image', imageSubtype: 'jpeg' },
  // PNG: 89 50 4E 47
  { bytes: [0x89, 0x50, 0x4e, 0x47], type: 'image', imageSubtype: 'png' },
  // WebP: RIFF....WEBP
  {
    bytes: [0x52, 0x49, 0x46, 0x46],
    type: 'image',
    imageSubtype: 'webp',
    extraCheck: (view) =>
      view.byteLength >= 12 &&
      view.getUint8(8) === 0x57 &&
      view.getUint8(9) === 0x45 &&
      view.getUint8(10) === 0x42 &&
      view.getUint8(11) === 0x50,
  },
  // ZIP (PK): DOCX is a ZIP file — requires extension check
  { bytes: [0x50, 0x4b, 0x03, 0x04], type: 'docx' },
];

const EXTENSION_MAP: Record<string, { type: FileType; imageSubtype?: ImageSubtype }> = {
  '.pdf': { type: 'pdf' },
  '.docx': { type: 'docx' },
  '.jpg': { type: 'image', imageSubtype: 'jpeg' },
  '.jpeg': { type: 'image', imageSubtype: 'jpeg' },
  '.png': { type: 'image', imageSubtype: 'png' },
  '.webp': { type: 'image', imageSubtype: 'webp' },
};

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

function matchMagicBytes(header: ArrayBuffer): {
  type: FileType;
  imageSubtype?: ImageSubtype;
} | null {
  const view = new DataView(header);

  for (const sig of MAGIC_BYTES) {
    const offset = sig.offset ?? 0;
    if (view.byteLength < offset + sig.bytes.length) continue;

    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (view.getUint8(offset + i) !== sig.bytes[i]) {
        match = false;
        break;
      }
    }

    if (match && sig.extraCheck && !sig.extraCheck(view)) {
      match = false;
    }

    if (match) {
      return { type: sig.type, imageSubtype: sig.imageSubtype };
    }
  }
  return null;
}

function readFileHeader(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file.slice(0, 16));
  });
}

export async function detectFileType(file: File): Promise<DetectedFile | null> {
  const ext = getExtension(file.name);
  const header = await readFileHeader(file);
  const magic = matchMagicBytes(header);

  if (magic) {
    // ZIP magic but not .docx extension — reject
    if (magic.type === 'docx' && ext !== '.docx') {
      return null;
    }
    return { file, ...magic };
  }

  // Fallback to extension
  const extInfo = EXTENSION_MAP[ext];
  if (extInfo) {
    return { file, ...extInfo };
  }

  return null;
}
