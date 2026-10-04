import SwipeDeck from "@/features/posts/components/SwipeDeck";

export default function HomePage() {
  return (
    <div>
      <h1 className="mb-1 text-center text-2xl font-bold">ปัดหาติวเตอร์ที่ใช่</h1>
      <p className="mb-5 text-center text-sm text-gray-500">ปัดขวาถ้าสนใจ ปัดซ้ายเพื่อข้าม</p>
      <SwipeDeck />
    </div>
  );
}
