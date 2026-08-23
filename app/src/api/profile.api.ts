import {
  updateProfilePictureRequestSchema,
  updateProfilePictureResponseSchema,
} from "@/schemas/user.schema";
import { post } from "./request.api";

export const updateProfilePicture = async (formdata: FormData) => {
  return post(
    "/profile/profile-picture",
    formdata,
    updateProfilePictureRequestSchema,
    updateProfilePictureResponseSchema,
  );
};
