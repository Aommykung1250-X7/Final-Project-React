import SwipeDeck from "@/features/tutors/components/SwipeDeck";
import { listTutorsForCurrentStudent } from "@/features/tutors/data/tutor-server";

// Tutor availability and profile details change often, so render this page per request.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { tutors, error } = await listTutorsForCurrentStudent();

  return (
    <div>
      <h1 className="mb-1 text-center text-2xl font-bold">ปัดหาติวเตอร์ที่ใช่</h1>
      <p className="mb-5 text-center text-sm text-gray-500">ปัดขวาถ้าสนใจ ปัดซ้ายเพื่อข้าม</p>
      <SwipeDeck initialTutors={tutors} initialError={error} />
    </div>
  );
}
