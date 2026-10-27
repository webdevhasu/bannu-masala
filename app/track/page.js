import TrackClient from './TrackClient';

export const metadata = {
  title: 'Track Your Order | Bannu Masala',
  description: 'Live order tracking and delivery status for Bannu Masala customers.',
};

export default async function TrackPage(props) {
  const searchParams = await props.searchParams;
  const initialOrder = searchParams?.order || '';
  const initialPhone = searchParams?.phone || '';

  return <TrackClient initialOrder={initialOrder} initialPhone={initialPhone} />;
}
