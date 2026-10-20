import { api } from "@/api";
import { Chip } from "@/components/ui/Chip";
import { EmptyPlaceholder } from "@/components/ui/EmptyPlaceholder";
import { SafeView } from "@/components/ui/SafeView";
import { CONTENT_MAX_WIDTH } from "@/constants/responsive.constant";
import { useRefresh } from "@/hooks/useRefresh";
import { AttendanceHistoryItem } from "@/schemas/attendance.schema";
import { useShowSnackbar } from "@/store/snackbar.store";
import { getApiErrorMessage } from "@/utils/api.util";
import { formatDay, formatRelativeDate } from "@/utils/date.util";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Divider, List, useTheme } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";

export default function AttendanceScreen() {
  const theme = useTheme();

  const queryClient = useQueryClient();
  const showSnackbar = useShowSnackbar();

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["attendance", "history"],
    queryFn: api.getAttendanceHistory,
  });

  const { refreshing, refresh } = useRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  useEffect(() => {
    if (isError) {
      showSnackbar(getApiErrorMessage(error), "error");
    }
  }, [isError, error, showSnackbar]);

  const renderItem: ListRenderItem<AttendanceHistoryItem> = useCallback(
    ({ item }) => (
      <List.Item
        title={formatRelativeDate(new Date(item.date))}
        titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
        description={`Logged ${item.totalHours} hours`}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        left={() => (
          <View style={styles.chipWrapper}>
            <Chip
              text={formatDay(new Date(item.date))}
              variant="filled"
              tone="neutral"
              size="medium"
            />
          </View>
        )}
        right={(props) => (
          <List.Icon
            {...props}
            icon="chevron-right"
            color={theme.colors.onSurfaceVariant}
          />
        )}
        onPress={() =>
          router.push({
            pathname: "/attendance/[id]",
            params: { id: item.id },
          })
        }
      />
    ),
    [theme],
  );

  return (
    <SafeView>
      <View style={styles.webWrapper}>
        {/* Appbar Header */}
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.Action icon="calendar-check" />
          <Appbar.Content title="Attendance Logs" titleStyle={styles.appbarTitle} />
        </Appbar.Header>

        {/* List Content / States */}
        {isLoading ? (
          <View style={styles.centeredContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centeredContainer}>
            <EmptyPlaceholder
              title="Failed to fetch attendance history"
              description="Please try again later."
            />
          </View>
        ) : (
          <FlatList
            data={data || []}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={Divider}
            style={styles.listFlex}
            contentContainerStyle={
              !data || data.length === 0 ? styles.emptyListContent : styles.listContent
            }
            refreshing={refreshing}
            onRefresh={refresh}
            ListEmptyComponent={
              <View style={styles.centeredContainer}>
                <EmptyPlaceholder
                  title="No attendance records found"
                  description="You haven't logged any attendance records yet."
                />
              </View>
            }
          />
        )}
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: "100%",
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: "center",
  },
  appbarTitle: {
    fontWeight: "700",
  },
  listFlex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  itemTitle: {
    fontWeight: "600",
  },
  chipWrapper: {
    justifyContent: "center",
    paddingLeft: 16,
  },
});
