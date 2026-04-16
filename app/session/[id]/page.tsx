import SessionClient from "@/components/session/SessionClient";

export default function SessionPage({ params }: { params: { id: string } }) {
  return <SessionClient sessionId={params.id} />;
}
