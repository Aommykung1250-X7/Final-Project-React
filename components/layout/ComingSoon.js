export default function ComingSoon({ title, children }) {
  return (
    <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 text-center shadow">
      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="text-gray-500">{children}</p>
    </div>
  );
}
