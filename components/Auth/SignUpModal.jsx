import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import YupPassword from "yup-password";
YupPassword(yup); // extend yup

import Button from "../Button";
import { useState } from "react";
import { authApi } from "../../app/api/authApi";
import { setDataToAsyncStorage, toast } from "../../libs";

const schema = yup.object().shape({
  fullname: yup.string().required("Full name is required").max(30).min(6),
  email: yup.string().required("Email is required").max(20).min(5),
  password: yup
    .string()
    .required("Password is required")
    .password()
    .max(15)
    .min(8),
  repeatPassword: yup
    .string()
    .required("Repeat password is required")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const SignUpModal = ({ changeOption, isLoading, setIsLoadings }) => {
  const [passwordVisible, setPasswordVisible] = useState(true);

  // react hook form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      repeatPassword: "",
    },
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    // call api to create new account
    const res = await authApi.register(data);

    if (Object.keys(res.data).length > 0) {
      // save account data to async storage
      await setDataToAsyncStorage("acc", res.data);

      // change to login page
      setTimeout(function () {
        changeOption();
      }, 3000);
    }

    setIsLoading(false);

    // notify register new account successfully
    toast(res.message);
  };

  return (
    <View className="p-4 m-4 bg-white rounded items-center">
      {/* header */}
      <View className="py-2">
        <Text className="text-2xl font-bold text-center">Sign Up</Text>
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
              label="Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="fullname"
          //   rules={{ required: true }}
        />
        {errors.fullname && (
          <Text className="text-red-500 italic">{errors.fullname.message}</Text>
        )}
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
          //   rules={{ required: true }}
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
        <Controller
          control={control}
          rules={{
            maxLength: 100,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="w-full my-2 bg-white"
              label="Repeat Password"
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
          name="repeatPassword"
        />
        {errors.repeatPassword && (
          <Text className="text-red-500 italic">
            {errors.repeatPassword.message}
          </Text>
        )}
      </View>
      <View className="top-2 w-full space-y-2 pb-2">
        <Button title="Register" onPress={handleSubmit(onSubmit)} />
        <TouchableOpacity
          className="flex-row justify-end"
          onPress={changeOption}
        >
          <Text className="italic text-slate-500 text-right">
            Have you a account?{" "}
          </Text>
          <Text className="italic text-sky-500 font-medium text-right">
            Login here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpModal;
