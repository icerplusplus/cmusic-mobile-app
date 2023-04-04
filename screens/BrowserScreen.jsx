import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { avatar, fontMap, red } from "../utils/constants";
import HomeScreen from "./HomeScreen";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PlaylistsScreen from "./PlaylistsScreen";
import * as Icons from "react-native-heroicons/solid";
import { browserApi } from "../app/api/browserApi";
import { useDispatch, useSelector } from "react-redux";
import {
  setBanners,
  setFeatured,
  setNewReleaseChartSongs,
  setNewReleaseSongs,
} from "../app/reducers/browserSlice";
import Autocomplete from "react-native-autocomplete-input-v2";
import { deleteAllSpaceOfString, uniqueArray } from "../utils/helpers";
import ResultItem from "./../components/ResultItem";
import { GlobalContext } from "../contexts/GlobalContext";
import randomColor from "randomcolor";
import { getDataToAsyncStorage } from "../libs";
import { getFirstCharacter } from "../utils";
import { seletedName } from "../app/reducers";
import { memo } from "react";

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

const color = randomColor({ luminosity: "dark" });

const BrowserScreen = () => {
  // store
  const dispatch = useDispatch();
  const username = useSelector(seletedName);

  // state
  const [query, setQuery] = useState("");
  const [suggest, setSuggest] = useState([]);

  const [account, setAccount] = useState();

  useEffect(() => {
    (async () => {
      const userInfo = await getDataToAsyncStorage("acc");
      setAccount(userInfo);
    })();
  }, []);

  // context
  const { drawer } = useContext(GlobalContext);

  // ref
  const queryRef = useRef("");
  const inputRef = useRef(null);

  // useEffect(() => {
  //   const fetchHomeData = async () => {
  //     const data = await browserApi.getBrowserData();
  //     const browserData = data?.data?.data;
  //     // dispatch banner data
  //     const banners = browserData.items.find(
  //       (item) => item.sectionType === "banner"
  //     );
  //     // dispatch(setBanners(banners));

  //     // dispatch featured data
  //     const featuredData = browserData.items.reverse().filter((item) => {
  //       if (
  //         item.items &&
  //         item.items.length > 0 &&
  //         item.sectionType !== "banner" &&
  //         item.sectionType !== "livestream" &&
  //         item.title
  //       ) {
  //         return item.items;
  //       }
  //     });
  //     browserData.items.filter((item) => {
  //       if (item.sectionType === "new-release") {
  //         const newRelease = {
  //           sectionId: "new-release-encode-id",
  //           encodeId: "new-release-encode-id",
  //           sectionType: item.sectionType,
  //           title: item.title,
  //           items: item.items.all,
  //           type: "song",
  //         };
  //         featuredData.push(newRelease);

  //         featuredData.reverse();

  //         // save NewReleaseSongs
  //         dispatch(setNewReleaseSongs(newRelease));
  //       }
  //       if (item.sectionType === "newReleaseChart") {
  //         const newReleaseChart = {
  //           sectionId: "newReleaseChart-encode-id",
  //           encodeId: "newReleaseChart-encode-id",
  //           sectionType: item.sectionType,
  //           title: item.title,
  //           items: item.items,
  //           type: "song",
  //         };

  //         // save NewReleaseSongs
  //         dispatch(setNewReleaseChartSongs(newReleaseChart));
  //       }
  //     });
  //     dispatch(setFeatured(featuredData));
  //   };

  //   fetchHomeData();
  // }, []);

  const handleSearchWithKeyword = async (event) => {
    const keyword = event.nativeEvent.text;
    try {
      if (keyword) {
        const { data } = await browserApi.search(event.nativeEvent.text);

        const { top: topItem } = data;

        let newSuggess = [];
        if (topItem) {
          const topItemSuggest = {
            encodeId: topItem.encodeId || topItem.id,
            keyword: topItem.title || topItem.name,
            artistsNames: topItem.artistsNames,
            thumbnailM: topItem.thumbnailM || topItem.thumbnail,
            alias: [
              topItem.alias,
              topItem.title,
              topItem.artistsNames,
              topItem.name,
              keyword,
            ],
            type: topItem.objectType,
            duration: topItem?.duration || 0,
          };
          queryRef.current = deleteAllSpaceOfString(keyword);

          newSuggess.push(topItemSuggest);
        }
        let keyTypes = Object.keys(data);
        keyTypes = keyTypes.filter((key) => key !== "videos");
        keyTypes &&
          keyTypes.map((key) => {
            if (Array.isArray(data[key])) {
              const sectionItem = data[key].map((item) => {
                if (item.encodeId === "ZW8I7FF8")
                  console.log("item.duration: ", item);
                return {
                  encodeId: item.encodeId || item.id,
                  keyword: item.title || item.name,
                  artistsNames: item.artistsNames,
                  thumbnailM: item.thumbnailM || item.thumbnail,
                  alias: [
                    item.alias,
                    item.title,
                    item.artistsNames,
                    item.name,
                    keyword,
                  ],
                  duration: item.duration,
                  type: key.toString().slice(0, -1),
                };
              });
              newSuggess.push(...sectionItem);
            }
          });

        if (newSuggess.length > 0) {
          inputRef.current.focus();
          setSuggest(uniqueArray(newSuggess, "encodeId"));
        }
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  const restrict = (event) => {
    const regex = new RegExp("^[a-zA-Z]+$");
    const key = String.fromCharCode(
      !event.charCode ? event.which : event.charCode
    );
    if (!regex.test(key)) {
      event.preventDefault();
      return false;
    }
  };

  const findData = (query) => {
    try {
      if (query === "") {
        return [];
      }
      const regex = new RegExp(`${query}`, "i");
      return suggest.filter((item) => {
        const keyList =
          item.alias &&
          item.alias.map(
            (it) => it && deleteAllSpaceOfString(it.toLowerCase().trim())
          );

        const findKey = keyList.map(
          (kw) => kw && kw.toLowerCase().trim().search(regex) >= 0
        );
        if (findKey) return item;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const dataFilter = findData(query.toLowerCase().trim());
  const comp = (a, b) => a.toLowerCase() === b.toLowerCase();

  // font custom
  const [fontsLoaded] = useFonts(fontMap);
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  return (
    <SafeAreaView
      className="relative bg-main pt-4 space-y-4 flex-1 "
      onLayout={onLayoutRootView}
    >
      {/* Header */}
      <View className="relative px-4 space-y-4 pb-2">
        <View className="flex-row ">
          <View className="flex-1">
            <Text className=" text-slate-400 font-['Montserrat-Medium']">
              Wellcome To
            </Text>
            <Text className=" text-white text-xl font-['Montserrat-SemiBold']">
              MY HOME
            </Text>
          </View>
          {/* avatar */}
          <TouchableOpacity
            className={`justify-center`}
            onPress={() => drawer.current.openDrawer()}
          >
            {username ? (
              <View
                className={`w-12 h-12 rounded-full justify-center items-center`}
                style={{
                  borderColor: "white",
                  borderWidth: 1,
                  backgroundColor: color,
                }}
              >
                {account ? (
                  <Image
                    source={{ uri: account.avatar }}
                    className="rounded-full w-10 h-10"
                  />
                ) : (
                  <Text className="text-xl font-bold text-white">
                    {getFirstCharacter(username).toUpperCase()}
                  </Text>
                )}
              </View>
            ) : (
              <View
                className={`w-10 h-10 rounded-full justify-center items-center`}
                style={{
                  borderColor: "white",
                  borderWidth: 1,
                  backgroundColor: color,
                }}
              >
                <Text className="text-2xl font-bold text-white">?</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        {/* Search Input */}

        <View className="">
          <View
            className="relative flex-row space-x-2 items-center bg-[#242636] min-h-[48px] px-3 py-2 rounded-md"
            style={{
              shadowOpacity: 5,
              shadowOffset: {
                width: 0,
                height: 8,
              },
              elevation: 10,
            }}
          >
            <Icons.MagnifyingGlassIcon
              color={"#A1A1AD"}
              className="absolute top-0 mt-3 ml-3"
              onPress={() => {
                inputRef.current.focus();
              }}
            />

            {/* && comp(query, dataFilter[0].keyword) */}
            <Autocomplete
              ref={inputRef}
              // autoCapitalize="none"
              // autoCorrect={false}
              placeholder="Tìm kiếm bài hát, nghệ sĩ..."
              data={
                dataFilter &&
                dataFilter.length === 1 &&
                comp(queryRef.current, dataFilter[0].keyword)
                  ? []
                  : dataFilter
              }
              value={query}
              onChangeText={(text) => setQuery(text)}
              onSubmitEditing={handleSearchWithKeyword}
              onKeyPress={restrict}
              flatListProps={{
                keyExtractor: (_, idx) => idx,
                renderItem: ({ item, index }) => (
                  <ResultItem onPress={() => setQuery("")} item={item} />
                ),
              }}
              style={{
                flex: 1,
                backgroundColor: "#242636",
                // height: 30,
                paddingLeft: 3,
                color: "#A1A1AD",
              }}
              placeholderTextColor={"#A1A1AD"}
              cursorColor={"#A1A1AD"}
              listContainerStyle={{
                marginHorizontal: 13,
              }}
            />

            <Icons.AdjustmentsVerticalIcon
              color="#A1A1AD"
              className="absolute top-0 right-0 mt-3 mr-3 bg-[#242636]"
            />
          </View>
        </View>
      </View>

      {/* Body */}
      {/* <View style={{ zIndex: -1, flex: 1 }}></View> */}
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default memo(BrowserScreen);
