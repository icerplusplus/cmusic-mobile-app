import { View, ScrollView, Text, FlatList } from "react-native";
import Card from "./Card";
import { getShortString } from "./../utils/getShortString";
import { memo } from "react";

const CardList = ({ data, type }) => {
  return (
    // Container

    <FlatList
      style={{ marginTop: 5 }}
      ItemSeparatorComponent={() => <View style={{ padding: 5 }} />}
      horizontal
      showsHorizontalScrollIndicator={false}
      data={data}
      renderItem={({ item, index }) => {
        return (
          <Card
            index={index}
            id={item?.encodeId}
            type={type || item?.type || item?.textType}
            title={item?.title}
            artist={item?.artistsNames}
            thumbnail={item?.thumbnailM}
            isLocal={item?.isLocal || false}
          />
        );
      }}
      keyExtractor={(item) => item?.encodeId}
    />
  );
};

export default memo(CardList);
