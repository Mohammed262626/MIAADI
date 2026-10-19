export function icon(
  name: string,
  opts: { size?: number; filled?: boolean; className?: string } = {}
): string {
  const { size = 22, filled = false, className = "" } = opts;
  const style = `font-size:${size}px;${filled ? "font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24;" : ""}`;
  return `<span class="material-symbols-outlined select-none ${className}" style="${style}" aria-hidden="true">${name}</span>`;
}
