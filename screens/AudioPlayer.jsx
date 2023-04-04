import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Button,
  ImageBackground,
} from "react-native";
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as Icons from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AudioControl from "../components/AudioControl";
import { useFonts } from "expo-font";
import { bg, fontMap } from "../utils/constants";
import * as SplashScreen from "expo-splash-screen";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { SERVER_API_URL } from "../configs";
import AudioTracks from "../components/AudioTracks";
import { joinArtistsName } from "../utils/helpers";
import { AudioContext } from "../contexts/AudioContext";
import { GlobalContext } from "../contexts/GlobalContext";
import Loader from "../components/Loader";
import { browserApi } from "./../app/api/browserApi";
import {
  reset,
  selectSongs,
  setPlaylist,
  setPlaylistId,
  setSongIdIsPlaying,
  setSongs,
} from "../app/reducers/playlistSlice";
import { pagination } from "./../utils/helpers/index";

// refactor
import {
  selectSongIdIsPlaying,
  selectTypePlay,
  setTypePlay,
  selectPlaylistId,
  selectPlaylistTitle,
  setSongIdWillBeAddToFavorite,
} from "../app/reducers";
import {
  fetchLocalSongs,
  getAudioUriBySongId,
  getImageBackground,
  getIndexCurrent,
  getNewReleaseChartData,
  getPlaylistDataById,
  getSongDuration,
  getSongIdByIndex,
  getSongSingle,
} from "../libs";
import { Audio } from "expo-av";

const AudioPlayer = () => {
  // context
  // get track list is playing
  // const {
  //   setIsShowPopup,
  //   trackIndexIsPlaying,
  //   setTrackIndexIsPlaying,
  //   sound,
  //   fetchDetailPlaylist,
  //   isPlayingRef,
  // } = useContext(GlobalContext);

  useLayoutEffect(() => {
    navigator.setOptions({ headerShown: false });
  }, []);

  // navigation
  const navigator = useNavigation();

  // store
  const dispatch = useDispatch();
  const songIdIsPlaying = useSelector(selectSongIdIsPlaying);
  const typePlay = useSelector(selectTypePlay);
  const playlistId = useSelector(selectPlaylistId);
  const favoritePlaylist = useSelector(selectSongs);
  const audioTitle = useSelector(selectPlaylistTitle);

  // state
  const [showAudioQueue, setShowAudioQueue] = useState(false);
  const [imageBackground, setImageBackground] = useState(false);

  // song state
  const sound = useRef(new Audio.Sound()).current;
  const [songs, setSongs] = useState([]);
  // const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const indexTmp = getIndexCurrent(songs, songIdIsPlaying);

  const handleShowQueue = () => {
    setShowAudioQueue((prev) => !prev);
  };

  const setImageBgInitial = useCallback(() => {
    const image = getImageBackground(songs, songIdIsPlaying, typePlay);

    setImageBackground(image);
  }, [indexTmp]);

  const playNewAudio = useCallback(
    async (audioUri, songId = -1) => {
      // reset sound loader if it is playing
      console.log("url: ", audioUri);
      try {
        sound.unloadAsync();

        // set up song id to add favorite plsylist
        dispatch(setSongIdWillBeAddToFavorite(songIdIsPlaying));

        await sound.loadAsync({ uri: audioUri });

        // repeat play if song len = 1
        if (songs.length === 1) {
          // set looping mode
          await sound.setIsLoopingAsync(true);
        }
        await sound.playAsync();
      } catch (error) {
        console.log("error when play: ", error);
      }
    },
    [indexTmp]
  );

  useEffect(() => {
    (async () => {
      if (typePlay === "newReleaseChart" || typePlay === "new-release") {
        const data = await getNewReleaseChartData(typePlay);
        setSongs(data.items);
      } else if (typePlay === "playlist") {
        const data = await getPlaylistDataById(playlistId);
        setSongs(data.items);
      } else if (typePlay === "local-songs") {
        const localSongs = await fetchLocalSongs();
        setSongs(localSongs.data);
      } else if (typePlay === "favorite") {
        setSongs(favoritePlaylist);
      } else if (typePlay === "song-single") {
        const data = await getSongSingle(songIdIsPlaying);
        setSongs([data]);
      }
    })();

    return () => {
      unloadSound();
      // reset type play = playlist when this component unmount
      dispatch(setTypePlay("playlist"));
    };
  }, []);

  // const handlePlaybackStatus = useCallback(
  //   async (playbackStatus) => {
  //     if (!playbackStatus.isLoaded) {
  //       // Update your UI for the unloaded state
  //       if (playbackStatus.error) {
  //         console.log(
  //           `Encountered a fatal error during playback: ${playbackStatus.error}`
  //         );
  //         // Send Expo team the error on Slack or the forums so we can help you debug!
  //       }
  //     } else {
  //       // Update your UI for the loaded state

  //       if (playbackStatus.isPlaying) {
  //         // Update your UI for the playing state
  //         // isPlayingRef.current = true;
  //         setAudioPosition(playbackStatus.positionMillis);
  //       } else {
  //         // Update your UI for the paused state
  //       }

  //       if (playbackStatus.isBuffering) {
  //         // Update your UI for the buffering state
  //       }

  //       if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
  //         // The player has just finished playing and will stop. Maybe you want to play something else?
  //         console.log("playbackStatus.isLooping: ", playbackStatus.isLooping);
  //         console.log("play completed...");
  //         sound.unloadAsync();
  //         // reset duration time
  //         setAudioPosition(0);
  //         try {
  //           if (indexTmp !== songs.length - 1) {
  //             const songId = getSongIdByIndex(songs, indexTmp + 1);
  //             // playNewAudio(getAudioUriBySongId(songId));
  //             dispatch(setSongIdIsPlaying(songId));
  //           } else {
  //             const songId = getSongIdByIndex(songs, 0);
  //             // playNewAudio(getAudioUriBySongId(songId));
  //             dispatch(setSongIdIsPlaying(songId));
  //           }
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       }
  //     }
  //   },
  //   [indexTmp, songs]
  // );

  useEffect(() => {
    // listen all event before play audio
    // sound.setOnPlaybackStatusUpdate(handlePlaybackStatus);

    // update title

    // update audio duration
    // setAudioDuration(getSongDuration(songs, songIdIsPlaying));

    // play in first time
    // playNewAudio(getAudioUriBySongId(songIdIsPlaying));

    // update image background
    setImageBgInitial();
  }, [indexTmp]);

  const unloadSound = async () => {
    await sound.unloadAsync();
  };

  // useEffect(() => {
  //   // popup hidden
  //   setIsShowPopup(false);

  //   if (playlistIdRef.current !== playlistId) {
  //     unloadSound();
  //     playlistIdRef.current = playlistId;
  //   }
  //   if (
  //     playlistId !== -4 &&
  //     playlistId !== -3 &&
  //     playlistId !== -1 &&
  //     playlistId !== -2
  //   ) {
  // dispatch(reset());
  //   }

  //   fetchDetailPlaylist();
  //   if (
  //     playlistId !== -4 &&
  //     playlistId !== -3 &&
  //     playlistId !== -1 &&
  //     playlistId !== -2
  //   ) {
  //     setTrackIndexIsPlaying(0);
  //   }
  //   return () => {
  //     isPlayingRef.current = true;
  //     setIsShowPopup(true);
  //   };
  // }, [playlistId]);

  if (songs.length === 0) return <Loader />;

  return (
    <ImageBackground
      className="relative bg-main pt-5 space-y-2 h-full"
      style={{
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
      }}
      blurRadius={60}
      source={{ uri: imageBackground ? imageBackground : bg }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 mb-2">
        <TouchableOpacity onPress={() => navigator.goBack()}>
          <Icons.ChevronLeftIcon color={"#fff"} />
        </TouchableOpacity>

        <Text className="text-xl text-center text-white  font-extrabold w-4/5">
          {audioTitle}
        </Text>
        <TouchableOpacity onPress={() => setShowAudioQueue((cur) => !cur)}>
          <MaterialIcons name="playlist-play" size={26} color={"#fff"} />
        </TouchableOpacity>
      </View>

      {/* Thumbnail Playlists  */}

      <AudioControl
        sound={sound}
        songs={songs}
        songIdIsPlaying={songIdIsPlaying}
        imageBackground={imageBackground}
        // audioPosition={audioPosition}
        // setAudioPosition={setAudioPosition}
        audioDuration={audioDuration}
        setAudioDuration={setAudioDuration}
        playNewAudio={playNewAudio}
      />

      {/* All track of this playlist */}
      <AudioTracks
        sound={sound}
        songs={songs}
        songIdIsPlaying={songIdIsPlaying}
        showAudioQueue={showAudioQueue}
        handleShowQueue={handleShowQueue}
        playNewAudio={playNewAudio}
      />
    </ImageBackground>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});
export default memo(AudioPlayer);
