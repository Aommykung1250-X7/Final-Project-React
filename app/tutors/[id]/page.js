import TutorProfile from "@/features/tutors/components/TutorProfile";

// Server Component reads the dynamic [id] from the URL and hands it to the interactive Client Component.
export default async function TutorPage({ params }) {
  const { id } = await params;
  return <TutorProfile tutorId={id} />;
}
