import { Header } from "./header";
import { Footer } from "./footer";
import { MobileBookBar } from "./mobile-book-bar";

export function SiteShell({
  children,
  invertedHeader = false,
}: {
  children: React.ReactNode;
  invertedHeader?: boolean;
}) {
  return (
    <>
      <Header inverted={invertedHeader} />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBookBar />
    </>
  );
}
