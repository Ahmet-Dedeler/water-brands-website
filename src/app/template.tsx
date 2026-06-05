/** Re-mounts on navigation — opacity fade only, no slide. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
