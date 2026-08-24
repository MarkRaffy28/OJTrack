import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button, Divider, List, Text } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { useMutation } from "@tanstack/react-query";

import { updateProfilePicture as updateProfilePictureApi } from "@/api/profile.api";
import { Avatar } from "@/components/ui/Avatar";
import { ImageEditor, ImageEditorResult } from "@/components/media/ImageEditor";
import {
  ImageOptionsSheet,
  ImageOptionsSheetRef,
} from "@/components/ui/ImageOptionsSheet";
import { LogoutDialog } from "@/components/ui/LogoutDialog";
import { SafeView } from "@/components/ui/SafeView";

import { useImage } from "@/hooks/useImage";
import { useAuthUser, useUpdateUser } from "@/store/auth.store";
import { useCameraImage, useClearCameraImage } from "@/store/camera.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { useTheme } from "@/store/settings.store";
import { getInitials } from "@/utils/string.util";
import { getApiErrorMessage } from "@/utils/api.util";

interface ProfileItemProps extends ComponentProps<typeof List.Item> {
  leftIcon: IconSource;
  destination: string;
}

function ProfileItem({ leftIcon, destination, ...props }: ProfileItemProps) {
  return (
    <List.Item
      {...props}
      left={(props) => <List.Icon {...props} icon={leftIcon} />}
      right={(props) => <List.Icon {...props} icon="chevron-right" />}
      onPress={() => router.navigate(destination)}
    />
  );
}

export default function ProfileScreen() {
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  const cameraImage = useCameraImage();
  const clearCameraImage = useClearCameraImage();

  const showSnackbar = useShowSnackbar();

  const user = useAuthUser();
  const updateUser = useUpdateUser();

  const {
    image: editingImage,
    setImage: setEditingImage,
    clearImage: clearEditingImage,
  } = useImage();

  const imageOptionsSheetRef = useRef<ImageOptionsSheetRef>(null);

  const [logoutVisible, setLogoutVisible] = useState(false);

  useEffect(() => {
    if (!cameraImage) {
      return;
    }

    setEditingImage(cameraImage.uri);
    clearCameraImage();
  }, [cameraImage]);

  const handleChangePhoto = useCallback(() => {
    imageOptionsSheetRef.current?.present();
  }, []);

  const handleTakePhoto = useCallback(() => {
    imageOptionsSheetRef.current?.dismiss();
    router.push("camera");
  }, []);

  const mutation = useMutation({
    mutationFn: updateProfilePictureApi,

    onSuccess: ({ user }) => {
      updateUser(user);
      clearEditingImage();

      showSnackbar("Profile picture updated successfully");
    },

    onError: (error) => {
      showSnackbar(getApiErrorMessage(error), "error");
    },
  });

  const handleImageComplete = useCallback(
    async (result: ImageEditorResult) => {
      const blob = await fetch(result.uri).then((response) => response.blob());

      const formData = new FormData();

      formData.append("profile_picture", blob, "profile-picture.jpg");

      mutation.mutate(formData);
    },
    [mutation],
  );

  return (
    <SafeView>
      <ScrollView>
        <List.Section>
          <Avatar
            source={user?.profilePicture}
            text={getInitials(user?.fullName ?? "")}
            mode="edit"
            variant="large"
            onPress={handleChangePhoto}
          />

          <Text variant="titleLarge">{user?.fullName}</Text>

          <Text variant="bodyMedium">{user?.role}</Text>

          <Text variant="bodySmall">{user?.userId}</Text>

          <Divider />

          <List.Subheader>ACCOUNT</List.Subheader>

          <ProfileItem
            title="Personal Information"
            leftIcon="account-outline"
            destination=""
          />

          <ProfileItem
            title="Emergency Contact"
            leftIcon="car-emergency"
            destination=""
          />

          <ProfileItem
            title="Academic Information"
            leftIcon="school-outline"
            destination=""
          />

          <ProfileItem
            title="OJT Information"
            leftIcon="briefcase-outline"
            destination=""
          />

          <ProfileItem title="Change Password" leftIcon="lock-outline" destination="" />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>APP</List.Subheader>

          <ProfileItem
            title="Appearance"
            leftIcon="palette-outline"
            destination="/profile/appearance"
          />

          <ProfileItem
            title="About OJTrack"
            leftIcon="information-outline"
            destination=""
          />
        </List.Section>

        <Divider />

        <Button onPress={() => setLogoutVisible(true)}>Logout</Button>
      </ScrollView>

      <ImageOptionsSheet
        ref={imageOptionsSheetRef}
        onImageSelected={(image) => setEditingImage(image.uri)}
        onTakePhoto={handleTakePhoto}
      />

      {editingImage && (
        <View
          style={[
            styles.editorOverlay,
            {
              backgroundColor: theme.colors.background,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <ImageEditor
            uri={editingImage}
            cropSize={320}
            outputSize={512}
            compression={0.8}
            minZoom={1}
            maxZoom={3}
            zoomStep={0.05}
            isSaving={mutation.isPending}
            onCancel={clearEditingImage}
            onComplete={handleImageComplete}
          />
        </View>
      )}

      <LogoutDialog visible={logoutVisible} onDismiss={() => setLogoutVisible(false)} />
    </SafeView>
  );
}

const styles = StyleSheet.create({
  editorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
