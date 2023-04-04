import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AlbumList from "./CardList";
import { memo, useCallback, useEffect } from "react";
import { splitText } from "../utils/splitText";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const FeatureRow = ({ title, component, type }) => {
  const navigator = useNavigation();

  const renderFeatureComponent = () => {
    return component;
  };

  const handleNavigation = () => {
    // if (type === "playlist") navigator.navigate("Playlists");
  };

  return (
    <View>
      {/* Header */}
      <View className="flex-row justify-between items-center py-2">
        <View className="flex-row space-x-1">
          <Text className="font-['Montserrat-Medium'] text-xl text-white">
            {title}
          </Text>
        </View>
        {type !== "song" && (
          <TouchableOpacity onPress={handleNavigation}>
            <Text className="text-indigo-400 text-xs">See All</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Body */}
      <View>
        {/* Albums List */}
        {component && renderFeatureComponent()}
      </View>
    </View>
  );
};

export default FeatureRow;
