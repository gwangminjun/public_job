import { TripDetail } from '@/components/travel/TripDetail';

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  return <TripDetail tripId={tripId} />;
}
