// Member Card Component
// TODO: Add avatar, name, dates, role badge
// TODO: Add hover animation with Framer Motion
// TODO: Add click to view details

interface MemberCardProps {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  birthDate?: string;
}

export default function MemberCard({
  id,
  firstName,
  lastName,
  avatar,
  birthDate,
}: MemberCardProps) {
  // TODO: Implement styled card with glassmorphism
  return (
    <div>
      {/* TODO: Avatar */}
      <h3>{firstName} {lastName}</h3>
      {/* TODO: Birth date, role badge */}
    </div>
  );
}
