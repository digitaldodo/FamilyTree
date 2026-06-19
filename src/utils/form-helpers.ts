// Form Helpers

import { MemberWithRelations, CreateMemberInput, UpdateMemberInput } from "@/types/member";

export function getMemberDefaultValues(member?: MemberWithRelations): UpdateMemberInput {
  const formatDateToDDMMYYYY = (dateVal?: Date | string | null) => {
    if (!dateVal) return "";
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return "";
    const d = String(date.getUTCDate()).padStart(2, '0');
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const y = date.getUTCFullYear();
    return `${d}-${m}-${y}`;
  };

  if (!member) {
    return {
      firstName: "",
      lastName: "",
      middleName: "",
      birthDate: "",
      deathDate: "",
      gender: "OTHER",
      bio: "",
      imageUrl: undefined,  // Don't default to "" — it fails .url() validation
      phone: "",
      email: undefined,   // Don't default to "" — it fails .email() validation
      address: "",
      occupation: "",
    };
  }

  return {
    firstName: member.firstName,
    lastName: member.lastName,
    middleName: member.middleName || "",
    birthDate: formatDateToDDMMYYYY(member.birthDate),
    deathDate: formatDateToDDMMYYYY(member.deathDate),
    gender: member.gender || "OTHER",
    bio: member.bio || "",
    imageUrl: member.imageUrl || undefined,
    phone: member.phone || "",
    email: member.email || undefined,
    address: member.address || "",
    occupation: member.occupation || "",
  };
}
