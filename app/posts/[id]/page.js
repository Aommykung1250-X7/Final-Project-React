import Link from "next/link";
import { notFound } from "next/navigation";
import { getTutor, tutors } from "@/features/posts/data/tutors";

export function generateStaticParams() {
  return tutors.map((t) => ({ id: t.id }));
}

export default async function TutorPage({ params }) {
  const { id } = await params;
  const tutor = getTutor(id);
  if (!tutor) notFound();

  return (
    <article className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={tutor.photo} alt={tutor.name} className="aspect-square w-full object-cover" />
      <div className="space-y-3 p-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">{tutor.name}</h1>
          <span className="font-semibold text-rose-500">{tutor.pricePerHour} บาท/ชม.</span>
        </div>
        <p>{tutor.bio}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-gray-500">วิชา</dt>
          <dd>{tutor.subjects.join(", ")}</dd>
          <dt className="text-gray-500">ระดับชั้น</dt>
          <dd>{tutor.levels.join(", ")}</dd>
          <dt className="text-gray-500">รูปแบบ</dt>
          <dd>{tutor.mode}</dd>
          <dt className="text-gray-500">พื้นที่</dt>
          <dd>{tutor.province}</dd>
        </dl>
        <Link href="/" className="inline-block text-sm text-rose-500 underline">
          กลับไปปัดต่อ
        </Link>
      </div>
    </article>
  );
}
