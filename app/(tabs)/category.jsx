import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchCategory } from "@/hooks/useFetch";
import Header from "@/components/Header"; // Import your Header component
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 3; // Calculate width for 3 items with padding

const CategoryScreen = () => {
  const { t, i18n } = useTranslation("category");
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadCategories = async () => {
    try {
      const response = await fetchCategory();
      setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  useEffect(() => {
    loadCategories();
  }, []);
  
  const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      loadCategories();
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }, []);

  // const handleCategoryPress = (category) => {
  //   router.push({
  //     pathname: "/categorydetail",
  //     params: { categoryId: category.id },
  //   });
  // };
  const handleCategoryPress = async (categoryId, name, name_amh) => {
    router.push(
      `/(tabs)/categorydetail?categoryId=${categoryId}&name=${encodeURIComponent(name)}&name_amh=${encodeURIComponent(name_amh)}`
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item.id,item.name,item.name_amh)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <Text
        style={[
          styles.categoryText,
          { color: colorScheme === "dark" ? "#fff" : "#445396" },
        ]}
      >
        {i18n.language === "en" ? item.name : item.name_amh}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <Header />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colorScheme === "dark" ? "#fff" : "#445399"}
          />
        </TouchableOpacity>
        <Text
          className="font-poppins-bold"
          style={[
            styles.headerTitle,
            { color: colorScheme === "dark" ? "#fff" : "#445399" },
          ]}
        >
          {t("category")}
        </Text>
      </View>

      {/* Category Grid */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t("loading")}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: "#eee",
  },
  backButton: {
    padding: 10,
    // backgroundColor:"red",
    borderRadius: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  categoryItem: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    alignItems: "center",
    marginRight: 10,
    // backgroundColor:"red"
  },
  categoryImage: {
    width: ITEM_WIDTH - 16,
    height: ITEM_WIDTH - 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});

export default CategoryScreen;
