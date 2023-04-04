import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup); // extend yup
import Button from "../Button";
import { useState, useEffect } from "react";
import { setDataToAsyncStorage, toast } from "../../libs";
import { authApi } from "../../app/api/authApi";
import { useDispatch, useSelector } from "react-redux";
import { setName } from "../../app/reducers";

const schema = yup.object().shape({
  email: yup.string().required("Email is required").email().max(20),
  password: yup.string().required("Password is required").password().max(15),
});

const LoginModal = ({
  setAccount,
  changeOption,
  onModalWillHide,
  isLoading,
  setIsLoading,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(true);

  // store
  const dispatch = useDispatch();

  // react hook form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: yupResolver(schema),
  });

  // FACEBOOK login

  const handleFacebookLogin = async () => {
    // await LoginManager.logInWithPermissions(["email", "public_profile"]).then(
    //   (result) => {
    //     console.log("res from fb: ", result);
    //     if (
    //       result.declinedPermissions &&
    //       result.declinedPermissions.includes("email")
    //     ) {
    //       resCallback({ message: "Email is required" });
    //     }
    //     if (result.isCancelled) {
    //       console.log("err isCancelled");
    //     } else {
    //       const infoReq = new GraphRequest(
    //         "/me?fields=email,name,picture,friend",
    //         null,
    //         resCallback
    //       );
    //       new GraphRequestManager().addRequest(infoReq).start();
    //     }
    //   },
    //   function (error) {
    //     console.log("Login failed with error: ", error);
    //   }
    // );
  };

  const onFacebookLogin = async () => {
    try {
      await handleFacebookLogin();
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true);
    const res = await authApi.login(email, password);

    if (Object.keys(res.data).length > 0) {
      dispatch(setName(res.data.name));
      await setDataToAsyncStorage("acc", res.data);

      // update account info in drawer
      setAccount(res.data);
    }
    // hide modal
    onModalWillHide();
    setIsLoading(false);

    // notify login successfully
    toast(res.message);
  };

  return (
    <View className="p-4 m-4 bg-white rounded items-center">
      {/* header */}
      <View className="py-2">
        <Text className="text-2xl font-bold text-center">Sign In</Text>
        <Text className="text-sm text-center text-slate-400">
          Access to your account
        </Text>
      </View>
      <View className="w-full">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="w-full my-2 bg-white"
              label="Email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="email"
          // rules={{ required: true }}
        />
        {errors.email && (
          <Text className="text-red-500 italic">{errors.email.message}</Text>
        )}

        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="w-full my-2 bg-white"
              label="Password"
              secureTextEntry={passwordVisible}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              right={
                <TextInput.Icon
                  size={20}
                  icon={passwordVisible ? "eye" : "eye-off"}
                  iconColor={"gray"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
          )}
          name="password"
        />
        {errors.password && (
          <Text className="text-red-500 italic">{errors.password.message}</Text>
        )}
      </View>
      <View className="top-2 pb-2 w-full space-y-2">
        <Button title="Login" onPress={handleSubmit(onSubmit)} />
        <TouchableOpacity
          className="flex-row justify-end"
          onPress={changeOption}
        >
          <Text className="italic text-slate-500 text-right">
            Don't have account?{" "}
          </Text>
          <Text className=" text-sky-500 font-medium text-right">
            Create new account here
          </Text>
        </TouchableOpacity>
      </View>
      {/* social login  */}
      {/* <View className="w-full space-y-2">
        <Text className="text-center text-slate-400 uppercase m-5">Or</Text>
        <View>
          <Button
            class="bg-[#1976D2]"
            title="Sign in with Facebook"
            icon={<FontAwesome name={"facebook"} color={"#fff"} size={20} />}
            onPress={() => handleFacebookLogin()}
          />
        </View>
      </View> */}
    </View>
  );
};

export default LoginModal;
