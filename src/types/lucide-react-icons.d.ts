/**
 * Per-icon ESM entry points (see Vercel bundle-size guidance). Types are not shipped
 * on each file; this wildcard covers all icons under dist/esm/icons/.
 *
 * No top-level imports: this file must stay an ambient script so `declare module` applies.
 */
declare module 'lucide-react/dist/esm/icons/*' {
  import type { LucideIcon } from 'lucide-react';
  const Icon: LucideIcon;
  export default Icon;
}
