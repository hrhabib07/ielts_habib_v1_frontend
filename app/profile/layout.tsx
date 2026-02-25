/**
 * Profile: minimal internal layout (no full dashboard).
 * Root layout provides Header + Footer.
 */
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8">
      {children}
    </div>
  );
}
