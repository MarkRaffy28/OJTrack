import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button, Divider, List, Surface, Text } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { useMutation } from "@tanstack/react-query";

import { api } from "@/api";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
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

const CONTENT_MAX_WIDTH = 600;

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
    mutationFn: api.updateProfilePicture,

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
    <SafeView edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
          <Avatar
            source={user?.profilePicture}
            text={getInitials(user?.fullName ?? "")}
            mode="edit"
            variant="large"
            onPress={handleChangePhoto}
          />

          <View style={styles.headerText}>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurface, fontWeight: "700" }}
            >
              {user?.fullName}
            </Text>

            <Chip
              text={user?.role ?? ""}
              style={[
                styles.roleChip,
                { backgroundColor: theme.colors.secondaryContainer, alignSelf: "center" },
              ]}
              textStyle={{ color: theme.colors.onSecondaryContainer }}
            />

            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {user?.userId}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Surface style={styles.card} elevation={1}>
            <List.Subheader>ACCOUNT</List.Subheader>

            <ProfileItem
              title="Personal Information"
              leftIcon="account-outline"
              destination="/profile/personal-information"
            />

            <Divider style={styles.rowDivider} />

            <ProfileItem
              title="Emergency Contact"
              leftIcon="car-emergency"
              destination="profile/emergency-contact"
            />

            <Divider style={styles.rowDivider} />

            {user?.role === "student" && (
              <ProfileItem
                title="Academic Information"
                leftIcon="school-outline"
                destination="profile/academic-information"
              />
            )}

            <Divider style={styles.rowDivider} />

            <ProfileItem
              title="OJT Information"
              leftIcon="briefcase-outline"
              destination=""
            />

            <Divider style={styles.rowDivider} />

            <ProfileItem title="Change Password" leftIcon="lock-outline" destination="" />
          </Surface>

          <Surface style={styles.card} elevation={1}>
            <List.Subheader>APP</List.Subheader>

            <ProfileItem
              title="Appearance"
              leftIcon="palette-outline"
              destination="/profile/appearance"
            />

            <Divider style={styles.rowDivider} />

            <ProfileItem
              title="About OJTrack"
              leftIcon="information-outline"
              destination=""
            />
          </Surface>

          <Button
            mode="outlined"
            textColor={theme.colors.error}
            style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            onPress={() => setLogoutVisible(true)}
          >
            Logout
          </Button>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    marginBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerText: {
    minWidth: 170,
    gap: 6,
    alignItems: "center",
  },
  roleChip: {
    alignSelf: "flex-start",
  },
  content: {
    alignSelf: "center",
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 24,
  },
  card: {
    borderRadius: 24,
    overflow: "hidden",
  },
  rowDivider: {
    marginHorizontal: 16,
  },
  logoutButton: {
    borderRadius: 12,
  },
  editorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
