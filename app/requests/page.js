import RequestList from "@/features/requests/components/RequestList";

// Server Component shell; accepting/declining requests needs client state, so it is a Client Component.
export default function RequestsPage() {
  return <RequestList />;
}
