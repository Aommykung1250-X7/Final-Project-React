// Round profile picture used in chat and request lists.
// Without a photo it shows the first letter of the name, so nothing loads from outside the app.
export default function Avatar({ src, name = "", alt = "", className = "h-12 w-12" }) {
  const base = `${className} shrink-0 rounded-full`;
  if (!src) {
    return (
      <span aria-hidden={!alt} aria-label={alt || undefined} className={`${base} inline-flex items-center justify-center bg-rose-100 font-bold text-rose-700`}>
        {name.trim().slice(0, 1).toUpperCase() || "?"}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`${base} bg-rose-100 object-cover`} />;
}
