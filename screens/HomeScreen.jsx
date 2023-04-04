import MusicCarousel from "../components/MusicCarousel";
import FeatureRow from "../components/FeatureRow";
import CardList from "../components/CardList";
import useMusic from "../hooks/useMusic";
import { memo, useCallback, useContext, useEffect, useState } from "react";
import { HomeScreenContext } from "../contexts/HomeScreenContext";
import { View, Text, Image, TextInput, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { selectFeatured } from "../app/reducers/browserSlice";
import { featuredData } from "../libs";
import Loader from "./../components/Loader";

const HomeScreen = () => {
  const [playlists, setPlaylists] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState();

  useEffect(() => {
    (async () => {
      const data = await featuredData();

      data &&
        data.map((item) => {
          if (item.type === "playlist") {
            setPlaylists((prev) => [...prev, item.data]);
          } else {
            setTopPlaylists(item.data);
          }
        });
    })();
  }, []);

  if (playlists.length === 0) return <Loader />;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="space-y-4 p-4 bg-main"
    >
      {/* Carousel */}
      <View>
        <MusicCarousel />
      </View>

      <View className="">
        {playlists &&
          playlists.map((feature) => {
            const type =
              feature.sectionType ||
              (feature.sectionId === "hArtistTheme" ? "artist" : "");
            return (
              <FeatureRow
                key={feature?.sectionId || feature?.id}
                title={feature?.title}
                type={type}
                component={<CardList data={feature?.items} type={type} />}
              />
            );
          })}
        {topPlaylists &&
          topPlaylists.map((feature) => {
            const type =
              feature.sectionType ||
              (feature.sectionId === "hArtistTheme" ? "artist" : "");
            return (
              <FeatureRow
                key={feature?.sectionId || feature?.id}
                title={feature?.title}
                type={type}
                component={<CardList data={feature?.items} type={type} />}
              />
            );
          })}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
