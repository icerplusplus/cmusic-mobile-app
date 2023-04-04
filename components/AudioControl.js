import {
  View,
  Text,
  Dimensions,
  Image,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { repeatState } from "../utils/constants";
import { joinArtistsName } from "../utils/helpers";

import { MaterialIcons } from "@expo/vector-icons";
import * as Icons from "react-native-heroicons/solid";

import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSongs,
  selectTypePlay,
  setLyrics,
  setSongIdIsPlaying,
} from "../app/reducers/playlistSlice";
import LyricRender from "./LyricRender";
import { GlobalContext } from "../contexts/GlobalContext";
import TimeSliderDuration from "./TimeSliderDuration";
import { selectPlaylistId } from "./../app/reducers/playlistSlice";
import { setTypeIsPlaying } from "../app/reducers/browserSlice";

import {
  getAudioUriBySongId,
  getDataToAsyncStorage,
  getIndexCurrent,
  getSongDuration,
  getSongIdByIndex,
  toast,
} from "../libs";
import { favoriteApi } from "../app/api";
import { Modal } from "react-native-modal";

const AudioControl = ({
  sound,
  songs,
  songIdIsPlaying,
  imageBackground,
  // setAudioPosition,
  // audioPosition,
  audioDuration,
  setAudioDuration,
  playNewAudio,
}) => {
  // state
  const [thumbnail, setThumbnail] = useState();
  const [account, setAccount] = useState();
  const repeatModeRef = useRef(repeatState.NULL);
  const [volumeIsOpening, setVolumeIsOpening] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const [audioPosition, setAudioPosition] = useState(0);

  // ref
  const scrollX = useRef(new Animated.Value(0)).current;
  const thumbnailRef = useRef();

  // store
  const dispatch = useDispatch();
  const typePlay = useSelector(selectTypePlay);

  const indexCurrent = getIndexCurrent(songs, songIdIsPlaying);

  // const songs = useSelector(selectSongs);
  // const playlistId = useSelector(selectPlaylistId);
  // const typeIsPlaying = useSelector(setTypeIsPlaying);

  // global context
  const { toggleFavoriteSelecterModal } = useContext(GlobalContext);

  const setSongId = (id) => dispatch(setSongIdIsPlaying(id));

  // ref
  // const songsLengthRef = useRef(0);

  // scroll event
  // change next or previous audio with scroll position
  // const handleGetIndexByScrollEvent = (value) => {
  //   trackIdRef.current = Math.round(value / Dimensions.get("window").width);
  //   if (
  //     trackIdRef.current !== Math.round(value / Dimensions.get("window").width)
  //   ) {
  //     // setAudioDuration(0);
  //     // setAudioPosition(0);
  //   }
  // };

  // controll

  const skipPreviousAudio = useCallback(async () => {
    if (songs.length !== 1) {
      await sound.unloadAsync();

      // reset duration time
      // setAudioDuration(0);
      setAudioPosition(0);

      if (indexCurrent === 0) {
        const id = getSongIdByIndex(songs, songs.length - 1);
        setSongId(id);
        let url =
          typePlay === "local-songs"
            ? songs[songs.length - 1].audioUrl
            : getAudioUriBySongId(id);
        playNewAudio(url);
      } else {
        const id = getSongIdByIndex(songs, indexCurrent - 1);
        setSongId(id);

        let url =
          typePlay === "local-songs"
            ? songs[indexCurrent - 1].audioUrl
            : getAudioUriBySongId(id);
        playNewAudio(url);
      }
    }
  }, [songIdIsPlaying]);

  const skipNextAudio = useCallback(async () => {
    if (songs.length !== 1) {
      await sound.unloadAsync();
      // isPlayingRef.current = false;

      // reset duration time
      // setAudioDuration(0);
      setAudioPosition(0);

      if (indexCurrent === songs.length - 1) {
        const id = getSongIdByIndex(songs, 0);
        setSongId(id);
        let url =
          typePlay === "local-songs"
            ? songs[0].audioUrl
            : getAudioUriBySongId(id);
        playNewAudio(url);
      } else {
        const id = getSongIdByIndex(songs, indexCurrent + 1);
        setSongId(id);
        let url =
          typePlay === "local-songs"
            ? songs[indexCurrent + 1].audioUrl
            : getAudioUriBySongId(id);
        playNewAudio(url);
      }
    }
  }, [songIdIsPlaying]);

  const changeRepeatMode = () => {
    switch (repeatModeRef.current) {
      case repeatState.NULL:
        repeatModeRef.current = repeatState.ALWAYS;
        // set looping mode
        sound.setIsLoopingAsync(true);
        console.log("mode: ", repeatModeRef.current);

        break;
      default:
        repeatModeRef.current = repeatState.NULL;
        // set looping mode
        sound.setIsLoopingAsync(false);
        console.log("mode: ", repeatModeRef.current);

        break;
    }
  };

  const changeVolumeState = async () => {
    setVolumeIsOpening((prev) => !prev);
    await sound.setIsMutedAsync(volumeIsOpening);
  };

  const changeStateAudioIsPlaying = async () => {
    if (isPlaying) {
      await sound.pauseAsync();
      console.log("track is pausing...");
    } else {
      await sound.playAsync();
      console.log("track is playing...");
    }

    setIsPlaying((prev) => !prev);
  };

  const onScrollEvent = () => {
    return Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: { x: scrollX },
          },
        },
      ],
      {
        useNativeDriver: true,
      }
    );
  };

  const renderItems = useCallback(
    ({ item, idex }) => {
      const titleCustom = item?.title;

      return (
        <Animated.View className="items-center rounded-lg space-y-2">
          <View
            style={{ width: Dimensions.get("window").width }}
            className="items-center pt-4"
          >
            <Image
              className="rounded-lg "
              style={{
                width: Dimensions.get("window").width * 0.6,
                height: Dimensions.get("window").width * 0.6,
              }}
              source={{ uri: item?.thumbnailM || item?.thumbnail }}
            />
          </View>
          <View
            style={{
              width: Dimensions.get("window").width * 0.85,
            }}
            className="gap-2 items-center"
          >
            <Text className="text-center text-3xl text-white font-bold">
              {titleCustom}
            </Text>

            <Text className="text-center text-base text-white">
              {item?.artistsNames}
            </Text>
          </View>
        </Animated.View>
      );
    },
    [songs]
  );

  const handleAddSongToFavoriteList = async () => {
    if (!account) {
      // notify login successfully
      toast("Please login to use this feature !");
    } else {
      // const songCurrent = songs[indexCurrent];
      // console.log("song name: ", songCurrent.title);

      // const songId = songCurrent.encodeId || songCurrent.id;

      // dispatch(setSongIdIsPlaying(songId));

      // show modal
      toggleFavoriteSelecterModal();
    }
  };

  const handlePlaybackStatus = useCallback(
    async (playbackStatus) => {
      if (!playbackStatus.isLoaded) {
        // Update your UI for the unloaded state
        if (playbackStatus.error) {
          console.log(
            `Encountered a fatal error during playback: ${playbackStatus.error}`
          );
          // Send Expo team the error on Slack or the forums so we can help you debug!
        }
      } else {
        // Update your UI for the loaded state

        if (playbackStatus.isPlaying) {
          // Update your UI for the playing state
          // isPlayingRef.current = true;
          setAudioPosition(playbackStatus.positionMillis);
        } else {
          // Update your UI for the paused state
        }

        if (playbackStatus.isBuffering) {
          // Update your UI for the buffering state
        }

        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
          // The player has just finished playing and will stop. Maybe you want to play something else?
          console.log("playbackStatus.isLooping: ", playbackStatus.isLooping);
          console.log("play completed...");
          sound.unloadAsync();
          // reset duration time
          setAudioPosition(0);
          try {
            if (indexCurrent !== songs.length - 1) {
              const songId = getSongIdByIndex(songs, indexCurrent + 1);

              dispatch(setSongIdIsPlaying(songId));
            } else {
              const songId = getSongIdByIndex(songs, 0);
              dispatch(setSongIdIsPlaying(songId));
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    },
    [indexCurrent, songs]
  );

  useEffect(() => {
    // set new scroll event listeners
    // scrollX.addListener(({ value }) => {
    //   handleGetIndexByScrollEvent(value);
    // });

    // set account
    (async () => {
      const acc = await getDataToAsyncStorage("acc");
      setAccount(acc);
    })();

    return () => {
      // scrollX.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    // listen all event before play audio
    sound.setOnPlaybackStatusUpdate(handlePlaybackStatus);

    // update audio duration
    setAudioDuration(getSongDuration(songs, songIdIsPlaying));

    // play in first time
    let url =
      typePlay === "local-songs"
        ? songs[indexCurrent].audioUrl
        : getAudioUriBySongId(songIdIsPlaying);
    playNewAudio(url);
  }, [indexCurrent]);

  useEffect(() => {
    // update thumbnail
    setThumbnail(imageBackground);
  }, [imageBackground]);

  // useEffect(() => {
  //   if (songs) {
  //     // set audio url
  //     setAudioUriToSoundPlayer();
  //   }
  // }, [songIdIsPlaying]);

  if (songs.length === 0) return <Loader />;

  const titleCustom = songs[indexCurrent]?.title;
  const artistsNames =
    songs[indexCurrent]?.artistsNames ||
    joinArtistsName(songs[indexCurrent]?.artists);
  return (
    <View className="mt-4">
      {/* <Animated.FlatList
        ref={thumbnailRef}
        data={songs}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderItems}
        keyExtractor={(item) => item?.encodeId}
        pagingEnabled
        scrollEventThrottle={16}
        onScroll={onScrollEvent}
      /> */}

      <View className="items-center rounded-lg space-y-2">
        <View
          style={{ width: Dimensions.get("window").width }}
          className="items-center pt-4"
        >
          <Image
            className="rounded-lg "
            style={{
              width: Dimensions.get("window").width * 0.6,
              height: Dimensions.get("window").width * 0.6,
            }}
            source={{
              uri: thumbnail,
            }}
          />
        </View>
        <View
          style={{
            width: Dimensions.get("window").width * 0.85,
          }}
          className="gap-2 items-center"
        >
          <Text className="text-center text-3xl text-white font-bold">
            {titleCustom}
          </Text>

          <Text className="text-center text-base text-white">
            {artistsNames}
          </Text>
        </View>
      </View>
      <View className="space-y-2 mt-2">
        <View className="px-4">
          <TimeSliderDuration
            sound={sound}
            audioDuration={audioDuration}
            audioPosition={audioPosition}
            setAudioPosition={setAudioPosition}
          />
        </View>

        <View className="flex-row justify-around items-center px-4">
          {/* <TouchableOpacity onPress={changeVolumeState}>
            <MaterialIcons
              name={`${volumeIsOpening ? "volume-up" : "volume-off"}`}
              color={"#fff"}
              size={24}
            />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={changeRepeatMode}>
            <MaterialIcons
              name={`${
                repeatModeRef.current === repeatState.NULL
                  ? "repeat"
                  : "repeat-one-on"
              }`}
              color={"#fff"}
              size={24}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipPreviousAudio}>
            <MaterialIcons name="skip-previous" color={"#fff"} size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-[#21234ef5] rounded-full"
            onPress={changeStateAudioIsPlaying}
          >
            <MaterialIcons
              name={`${isPlaying ? "pause" : "play-arrow"}`}
              color={"#fff"}
              size={28}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={skipNextAudio}>
            <MaterialIcons name="skip-next" color={"#fff"} size={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleAddSongToFavoriteList()}>
            <MaterialIcons name={`library-add`} color={"#fff"} size={24} />
          </TouchableOpacity>
        </View>

        <View className="pt-5">
          <LyricRender
            currentTime={audioPosition}
            songIdIsPlaying={songIdIsPlaying}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    position: "absolute",
    top: 0,
    flex: 1,
    margin: 0,
    width: Dimensions.get("window").width,
  },
});

export default AudioControl;

{
  /* <ImageBlurShadow
          source={{ uri: item?.thumbnailM }}
          imageWidth={Dimensions.get("window").width * 0.6}
          imageHeight={Dimensions.get("window").width * 0.6}
          imageBorderRadius={22}
          shadowOffset={38}
          shadowBlurRadius={48}
          // shadowBackgroundColor={"#191B28"}
        /> */
  /* <Shadow distance={15} startColor={"#282648b0"} offset={[1, 4]}>
          <ImageBackground
            className="rounded-lg items-center justify-center"
            imageStyle={{ borderRadius: 8 }}
            style={{
              width: Dimensions.get("window").width * 0.7,
              height: Dimensions.get("window").width * 0.7,
            }}
            blurRadius={40}
            source={{ uri: item.thumbnail }}
          >
            <Image
              className="rounded-lg "
              style={{
                width: Dimensions.get("window").width * 0.6,
                height: Dimensions.get("window").width * 0.6,
                elevation: 2,
              }}
              source={{ uri: item.thumbnail }}
            />
          </ImageBackground>
        </Shadow> */
}
