export default function Loading() {
  return (
    <div className="min-h-screen bg-ivory pt-32">
      <div className="mx-auto max-w-[1440px] px-5">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-6 h-16 w-2/3" />
        <div className="skeleton mt-10 h-[50vh] w-full" />
      </div>
    </div>
  );
}
