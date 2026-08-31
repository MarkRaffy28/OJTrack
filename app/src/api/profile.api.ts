import {
  UpdateEmergencyContactRequest,
  UpdateEmergencyContactRequestSchema,
  UpdatePersonalInformationRequest,
  UpdatePersonalInformationRequestSchema,
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

export const updateProfilePicture = async (formdata: FormData) => {
  return post(
    "/profile/profile-picture",
    formdata,
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
