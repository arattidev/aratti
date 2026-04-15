import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "../../src/theme";

function TabIcon({ focused, label }: { focused: boolean; label: string }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="HOME" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="RESCUE" />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="ORDERS" />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="FAVS" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="WALLET" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 92,
    backgroundColor: "rgba(255, 255, 255, 0.84)",
    position: "absolute",
    marginHorizontal: 16,
    marginBottom: 18,
    borderRadius: 24,
    borderTopWidth: 0,
    paddingTop: 14,
    paddingBottom: 14,
    elevation: 0,
  },
  tabIcon: {
    minWidth: 72,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconActive: {
    backgroundColor: theme.colors.primaryContainer,
  },
  tabLabel: {
    color: "#989aa0",
    fontFamily: theme.typography.fontFamilyBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  tabLabelActive: {
    color: theme.colors.onPrimary,
  },
});
