import { api } from "@/api";
import { Chip } from "@/components/ui/Chip";
import { EmptyPlaceholder } from "@/components/ui/EmptyPlaceholder";
import { SafeView } from "@/components/ui/SafeView";
import { CONTENT_MAX_WIDTH } from "@/constants/responsive.constant";
import { OJT, OJTStatus } from "@/schemas/ojt.schema";
import { capitalize } from "@/utils/string.util";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Card,
  Divider,
  Icon,
  ProgressBar,
  Searchbar,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";

const STATUS_FILTERS: Array<"all" | OJTStatus> = ["all", "ongoing", "completed", "pending"];

export default function TraineesScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | OJTStatus>("all");

  const { data: ojts, isLoading, isError, refetch } = useQuery({
    queryKey: ["ojt", "all"],
    queryFn: api.getOJTs,
  });

  const filteredOJTs = (ojts || []).filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.student?.userId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" ? true : item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const renderItem = ({ item }: { item: OJT }) => {
    const required = item.requiredHours || 1;
    const rendered = item.renderedHours || 0;
    const progress = Math.min(1, Math.max(0, rendered / required));

    return (
      <Card
        style={[styles.card, { backgroundColor: theme.colors.elevation.level1 }]}
        onPress={() =>
          router.push({
            pathname: "/trainees/[id]",
            params: { id: item.id },
          })
        }
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.headerRow}>
            {item.student?.profilePicture ? (
              <Avatar.Image
                size={44}
                source={{ uri: `data:image/jpeg;base64,${item.student.profilePicture}` }}
              />
            ) : (
              <Avatar.Icon size={44} icon="account" />
            )}

            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: "700" }}>
                {item.student?.fullName || "Student"}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                ID: {item.student?.userId || "N/A"}
              </Text>
            </View>

            <Chip
              text={capitalize(item.status)}
              tone={
                item.status === "completed"
                  ? "success"
                  : item.status === "ongoing"
                  ? "info"
                  : "neutral"
              }
              variant="filled"
              size="small"
            />
          </View>

          <Divider style={{ marginVertical: 12 }} />

          {/* Progress Section */}
          <View style={styles.progressRow}>
            <View style={{ flex: 1 }}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                OJT Progress
              </Text>
              <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                {rendered} / {required} hrs ({Math.round(progress * 100)}%)
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeView style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.webWrapper}>
        <Appbar.Header elevated statusBarHeight={0}>
          <Appbar.Content title="Assigned Trainees" titleStyle={{ fontWeight: "700" }} />
        </Appbar.Header>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search by student name or ID..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
          />
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersRow}>
          {STATUS_FILTERS.map((status) => (
            <Chip
              key={status}
              text={status === "all" ? "All" : capitalize(status)}
              selected={selectedStatus === status}
              variant={selectedStatus === status ? "filled" : "outlined"}
              tone="neutral"
              size="small"
              onPress={() => setSelectedStatus(status)}
            />
          ))}
        </View>

        {/* Trainees List */}
        {isLoading ? (
          <View style={styles.centeredFill}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.centeredFill}>
            <EmptyPlaceholder
              title="Failed to load trainees"
              description="Please pull down to refresh."
            />
          </View>
        ) : (
          <FlatList
            data={filteredOJTs}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={
              filteredOJTs.length === 0 ? styles.emptyList : styles.listContent
            }
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
            ListEmptyComponent={
              <View style={styles.centeredFill}>
                <EmptyPlaceholder
                  title="No trainees found"
                  description="No trainees match the selected filters."
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    borderRadius: 16,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});
