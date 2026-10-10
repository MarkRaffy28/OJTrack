import { api } from "@/api";
import { Chip } from "@/components/ui/Chip";
import { EmptyPlaceholder } from "@/components/ui/EmptyPlaceholder";
import { SafeView } from "@/components/ui/SafeView";
import { CONTENT_MAX_WIDTH } from "@/constants/responsive.constant";
import { useAnimatedFAB } from "@/hooks/ui/useAnimatedFAB";
import { Report, ReportType, ReportTypeSchema } from "@/schemas/report.schema";
import { useShowSnackbar } from "@/store/snackbar.store";
import { useAppStyles } from "@/styles/app.styles";
import { getApiErrorMessage } from "@/utils/api.util";
import { formatDateOnly, formatNamedDate } from "@/utils/date.util";
import { capitalize } from "@/utils/string.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  AnimatedFAB,
  Appbar,
  Divider,
  IconButton,
  List,
  useTheme,
} from "react-native-paper";

import { useAuthUser } from "@/store/auth.store";
import { ConfirmDialog } from "@/components/ui/Dialog/Confirm";
import { useRefresh } from "@/hooks/useRefresh";

const REPORT_TYPES = ["all", ...ReportTypeSchema.options] as const;
type ReportTabType = string;

const getStatusTone = (
  status?: string,
): "neutral" | "success" | "warning" | "info" | "error" => {
  switch (status?.toLowerCase()) {
    case "approved":
    case "completed":
      return "success";
    case "pending":
    case "in_review":
      return "warning";
    case "rejected":
    case "failed":
      return "error";
    case "draft":
      return "info";
    default:
      return "neutral";
  }
};

export default function ReportsScreen() {
  const theme = useTheme();
  const appStyles = useAppStyles();

  const queryClient = useQueryClient();
  const showSnackbar = useShowSnackbar();

  const user = useAuthUser();
  const isSupervisor = user?.role === "supervisor";

  const { expanded, onScroll } = useAnimatedFAB();

  const [selectedFilter, setSelectedFilter] = useState<ReportTabType>("all");

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [reportIdToDelete, setReportIdToDelete] = useState<number | null>(null);

  const filterTabs = isSupervisor
    ? ["all", "pending", "approved", "rejected", ...ReportTypeSchema.options]
    : REPORT_TYPES;

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["reports"],
    queryFn: api.getReports,
  });

  const { refreshing, refresh } = useRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const mutation = useMutation({
    mutationFn: api.deleteReport,
    onSuccess: () => {
      showSnackbar("Report deleted successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => {
      showSnackbar(getApiErrorMessage(error), "error");
    },
  });

  useEffect(() => {
    if (isError) {
      showSnackbar(getApiErrorMessage(error), "error");
    }
  }, [isError, error, showSnackbar]);

  const filteredReports = (data || []).filter((report) => {
    if (selectedFilter === "all") return true;
    if (
      selectedFilter === "pending" ||
      selectedFilter === "approved" ||
      selectedFilter === "rejected"
    ) {
      return report.status === selectedFilter;
    }
    return report.type === selectedFilter;
  });

  const handleOpenDeleteDialog = useCallback((id: number) => {
    setReportIdToDelete(id);
    setDeleteDialogVisible(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialogVisible(false);
    setReportIdToDelete(null);
  }, []);

  const handleDeleteReport = useCallback(() => {
    if (reportIdToDelete === null || mutation.isPending) {
      return;
    }

    mutation.mutate(reportIdToDelete);
    handleCloseDeleteDialog();
  }, [reportIdToDelete, mutation, handleCloseDeleteDialog]);

  const renderReportItem = useCallback(
    ({ item }: { item: Report }) => (
      <List.Item
        title={
          item.student?.fullName
            ? `${capitalize(item.type ?? "Report")} (${item.student.fullName})`
            : capitalize(item.type ?? "Report")
        }
        titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
        description={`Date: ${formatNamedDate(new Date(item.reportDate))}`}
        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
        onPress={() =>
          router.push({
            pathname: "/reports/[id]",
            params: { id: item.id },
          })
        }
        left={() => (
          <View style={styles.statusChipContainer}>
            <Chip
              text={capitalize(item.status ?? "Pending")}
              tone={getStatusTone(item.status)}
              variant="filled"
              size="small"
            />
          </View>
        )}
        right={(props) => (
          <View style={styles.actionGroup}>
            <IconButton
              {...props}
              icon="chevron-right"
              size={20}
              iconColor={theme.colors.onSurfaceVariant}
              onPress={() =>
                router.push({
                  pathname: "/reports/[id]",
                  params: { id: item.id },
                })
              }
            />
            {!isSupervisor && (
              <IconButton
                {...props}
                icon="trash-can-outline"
                size={20}
                iconColor={theme.colors.error}
                onPress={() => handleOpenDeleteDialog(item.id)}
              />
            )}
          </View>
        )}
      />
    ),
    [theme, isSupervisor, handleOpenDeleteDialog],
  );

  return (
    <SafeView>
      <View style={styles.webWrapper}>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.Action icon="file-document" />
          <Appbar.Content
            title={isSupervisor ? "Review Reports" : "Reports"}
            titleStyle={styles.appbarTitle}
          />
        </Appbar.Header>

        {/* Filter Chips Bar */}
        <View
          style={[styles.filterBarContainer, { backgroundColor: theme.colors.surface }]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterBar}
          >
            {filterTabs.map((type) => (
              <Chip
                key={type}
                text={type === "all" ? "All" : capitalize(type ?? "")}
                selected={selectedFilter === type}
                variant={selectedFilter === type ? "filled" : "outlined"}
                tone="neutral"
                size="medium"
                onPress={() => setSelectedFilter(type)}
              />
            ))}
          </ScrollView>
        </View>

        <Divider />

        {/* Main List Area */}
        {isLoading ? (
          <View style={styles.centeredFill}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centeredFill}>
            <EmptyPlaceholder
              title="Failed to fetch reports"
              description="Please try again later."
            />
          </View>
        ) : (
          <FlatList
            data={filteredReports}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderReportItem}
            ItemSeparatorComponent={Divider}
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={styles.listFlex}
            contentContainerStyle={
              filteredReports.length === 0 ? styles.emptyListContent : styles.listContent
            }
            refreshing={refreshing}
            onRefresh={refresh}
            ListEmptyComponent={
              <View style={styles.centeredFill}>
                <EmptyPlaceholder
                  title="No reports found"
                  description={
                    selectedFilter === "all"
                      ? "No reports submitted yet."
                      : `No ${selectedFilter} reports found.`
                  }
                />
              </View>
            }
          />
        )}

        {/* Floating Action Button (Students only) */}
        {!isSupervisor && (
          <AnimatedFAB
            icon="plus"
            label="New Report"
            extended={expanded}
            animateFrom="right"
            iconMode="dynamic"
            visible
            onPress={() => router.push("/reports/new")}
            style={appStyles.fab}
          />
        )}
      </View>

      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Report"
        description="Are you sure you want to delete this report?"
        actionLabel="Delete"
        onCancel={handleCloseDeleteDialog}
        onAction={handleDeleteReport}
        destructive
      />
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
  filterBarContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  filterBar: {
    gap: 8,
  },
  listFlex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 96,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  itemTitle: {
    fontWeight: "600",
  },
  statusChipContainer: {
    justifyContent: "center",
    paddingLeft: 16,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
});
