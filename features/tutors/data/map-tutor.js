// Shared by tutor-server.js (server) and tutor-service.js (browser) so a new column is added in one place.
export const TUTOR_COLUMNS = "user_id, bio, subjects, levels, price_per_hour, teaching_mode, province, district, photo_url";

export function mapTutor(row, profile) {
  return {
    id: row.user_id,
    name: profile?.display_name || "ติวเตอร์",
    photo: row.photo_url || profile?.avatar_url || "/images/tutor-placeholder.svg",
    subjects: row.subjects || [],
    levels: row.levels || [],
    pricePerHour: row.price_per_hour,
    mode: row.teaching_mode,
    province: row.province,
    district: row.district || "",
    bio: row.bio,
  };
}
