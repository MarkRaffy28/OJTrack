import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
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
import { ListSubheader } from "@/components/paper/ListSubheader";
import { LogoutDialog } from "@/components/ui/LogoutDialog";
import { SafeView } from "@/components/ui/SafeView";

import { useImage } from "@/hooks/useImage";
import { useRefreshUser } from "@/hooks/useRefreshUser";
import { useAuthUser, useUpdateUser } from "@/store/auth.store";
import { useCameraImage, useClearCameraImage } from "@/store/camera.store";
import { useShowSnackbar } from "@/store/snackbar.store";
import { useTheme } from "@/store/settings.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { getInitials } from "@/utils/string.util";

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

  const { refreshing, refreshUser } = useRefreshUser();

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
    <SafeView edges={["bottom"]} style={{ backgroundColor: theme.colors.primary }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshUser} />
        }
      >
        {/* Header Background */}
        <View
          style={[
            styles.brandHeader,
            {
              backgroundColor: theme.colors.primary,
              paddingTop: insets.top,
            },
          ]}
        />

        {/* Full-width white body */}
        <View style={[styles.bodyContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.innerContainer}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Avatar
                source={user?.profilePicture}
                text={getInitials(user?.fullName ?? "")}
                mode="edit"
                variant="large"
                onPress={handleChangePhoto}
              />
            </View>

            {/* User Information */}
            <View style={styles.headerText}>
              <Text
                variant="titleLarge"
                style={[
                  styles.centerText,
                  { color: theme.colors.onSurface, fontWeight: "700" },
                ]}
              >
                {user?.fullName}
              </Text>

              <Text
                variant="bodyMedium"
                style={[
                  styles.centerText,
                  { color: theme.colors.onSurfaceVariant, textTransform: "uppercase" },
                ]}
              >
                {user?.role}
              </Text>

              <Text
                variant="bodySmall"
                style={[styles.centerText, { color: theme.colors.outline }]}
              >
                ID: {user?.userId}
              </Text>

              <View style={styles.emailContainer}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {user?.email}
                </Text>

                {user?.emailVerifiedAt ? (
                  <Chip
                    text="Verified"
                    variant="filled"
                    tone="success"
                    selected
                    size="small"
                    rightIcon="check-decagram"
                  />
                ) : (
                  <Chip
                    text="Verify"
                    variant="filled"
                    tone="warning"
                    size="small"
                    leftIcon="alert-circle-outline"
                    onPress={() => router.navigate("/profile/verify-email") }
                  />
                )}
              </View>
            </View>

            {/* Account Options */}
            <Surface style={styles.card} elevation={1}>
              <ListSubheader>ACCOUNT</ListSubheader>

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

              <ProfileItem
                title="Change Password"
                leftIcon="lock-outline"
                destination="/profile/change-password"
              />
            </Surface>

            {/* App Options */}
            <Surface style={styles.card} elevation={1}>
              <ListSubheader>APP</ListSubheader>

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
  },
  brandHeader: {
    height: 150,
    width: "100%",
  },
  bodyContent: {
    flex: 1,
    width: "100%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 32,
    marginTop: -30,
  },
  innerContainer: {
    alignSelf: "center",
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 16,
    paddingTop: 72,
    gap: 24,
  },
  avatarWrapper: {
    position: "absolute",
    top: -60,
    alignSelf: "center",
    zIndex: 10,
  },
  headerText: {
    width: "100%",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  centerText: {
    textAlign: "center",
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
