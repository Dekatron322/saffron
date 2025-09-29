import axios from "axios"

export const signUpUser = async (username: string, password: string) => {
  const response = await axios.post("https://amd-backend-1.onrender.com/custom-user/sign-up/", {
    username,
    password,
  })

  return response
}
