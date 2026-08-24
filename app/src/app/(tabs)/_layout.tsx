import { View } from "react-native";
import { Tabs } from "expo-router";
import { Icon } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

import { QRTabButton } from "@/components/navigation/QRTabButton";
import { useTabLayoutStyles } from "@/styles/tabLayout.styles";

const getIcon = (
  focused: boolean,
  size: number,
  focusedIcon: IconSource,
  unfocusedIcon: IconSource,
) => {
  const styles = useTabLayoutStyles();

  return (
    <View style={styles.tabScreen.view(focused)}>
      <Icon
        source={focused ? focusedIcon : unfocusedIcon}
        size={size}
        color={styles.tabScreen.icon(focused)}
      />
    </View>
  );
};

export default function TabLayout() {
  const styles = useTabLayoutStyles();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: styles.tabBar.activeTint,
          tabBarLabelStyle: styles.tabBar.label,
          tabBarStyle: styles.tabBar.container,
          sceneStyle: styles.tabBar.scene,
          animation: "shift",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ size, focused }) =>
              getIcon(focused, size, "home", "home-outline"),
          }}
        />

        <Tabs.Screen
          name="reports"
          options={{
            title: "Reports",
            tabBarIcon: ({ size, focused }) =>
              getIcon(focused, size, "file-document", "file-document-outline"),
          }}
        />

        <Tabs.Screen
          name="qr"
          options={{
            title: "",
            tabBarButton: (props) => <QRTabButton {...props} />,
          }}
        />

        <Tabs.Screen
          name="announcements"
          options={{
            title: "Announcements",
            tabBarIcon: ({ size, focused }) =>
              getIcon(focused, size, "bullhorn", "bullhorn-outline"),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ size, focused }) =>
              getIcon(focused, size, "account-circle", "account-circle-outline"),
          }}
        />
      </Tabs>
    </>
  );
}
