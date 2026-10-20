import qrcode from "qrcode-generator";

/** Real, scannable QR code as an inline SVG (2-colour, scalable). */
export function qrSvg(text: string): string {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true }).replace("<svg ", '<svg class="w-full h-full" ');
}
