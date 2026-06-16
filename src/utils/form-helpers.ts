// Form Helpers

import { MemberWithRelations, CreateMemberInput, UpdateMemberInput } from "@/types/member";

export function getMemberDefaultValues(member?: MemberWithRelations): UpdateMemberInput {
  if (!member) {
    return {
      firstName: "",
      lastName: "",
      middleName: "",
      birthDate: "",
      deathDate: "",
      gender: "OTHER",
      bio: "",
      avatar: "",
      phone: "",
      email: "",
      address: "",
      occupation: "",
    };
  }

  return {
    firstName: member.firstName,
    lastName: member.lastName,
    middleName: member.middleName || "",
    birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : "",
    deathDate: member.deathDate ? new Date(member.deathDate).toISOString().split('T')[0] : "",
    gender: member.gender || "OTHER",
    bio: member.bio || "",
    avatar: member.avatar || "",
    phone: member.phone || "",
    email: member.email || "",
    address: member.address || "",
    occupation: member.occupation || "",
  };
}
