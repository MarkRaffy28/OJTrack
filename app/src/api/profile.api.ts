import {
  UpdateEmergencyContactRequest,
  UpdateEmergencyContactRequestSchema,
  UpdatePersonalInformationRequest,
  UpdatePersonalInformationRequestSchema,
  UpdateProfilePictureRequest,
  UpdateProfilePictureRequestSchema,
  UserResponseSchema,
} from "@/schemas/user.schema";
import { patch, post } from "./request.api";

export const updateEmergencyContact = async (data: UpdateEmergencyContactRequest) => {
  return patch(
    "/profile/emergency-contact",
    data,
    UpdateEmergencyContactRequestSchema,
    UserResponseSchema,
  )
}

export const updateProfilePicture = async (data: UpdateProfilePictureRequest) => {
  return post(
    "/profile/profile-picture",
    data,
    UpdateProfilePictureRequestSchema,
    UserResponseSchema,
  );
};

export const updatePersonalInformation = async (data: UpdatePersonalInformationRequest) => {
  return patch(
    "/profile/personal-information",
    data,
    UpdatePersonalInformationRequestSchema,
    UserResponseSchema,
  )
}
