import { Metadata } from 'next';
import { GreetingsStudio } from '@/components/features/greetings/greetings-studio';

export const metadata: Metadata = {
  title: 'Family Greetings Studio | FamilyTree',
  description: 'Create beautiful family greetings and posters.',
};

export default function GreetingsPage() {
  return <GreetingsStudio />;
}
