import React from "react";
import { useNavigate } from "react-router-dom";
import SignIn from "../assets/signin.png";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import { baseUrl } from "../urls";

function Signin() {
  const navigate = useNavigate();

  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    const { email, password } = user;
    if (email === "" || password === "") {
      alert("Please fill in all the fields");
      return;
    }
    e.preventDefault();
    const response = await fetch(`${baseUrl}/api/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token") ?? "",
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        return alert("Invalid username or password");
      }
    }
    alert("Logged in Successfully");
    const jsonData = await response.json();
    localStorage.setItem("token", jsonData.data.refreshToken);
    localStorage.setItem("firstName", jsonData.data.user.firstName);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center">
      <img className="hidden md:block lg:block" src={SignIn} alt="signin" style={{ width: "740px" }} />
      <form className="flex flex-col gap-4 border rounded-2xl px-10 py-5 mt-7 md:mt-0 lg:mt-0">
        <h1 className="text-dark text-4xl font-extrabold">
          Fill what we know <span className="text-red">!</span>
        </h1>
        <TextField
          sx={{ m: 1, width: "100%" }}
          id="standard-basic"
          label="Email"
          variant="standard"
          value={user.email}
          name="email"
          onChange={handleUserChange}
        />
        <FormControl sx={{ m: 1, width: "100%" }} variant="standard">
          <InputLabel htmlFor="standard-adornment-password">
            Password
          </InputLabel>
          <Input
            id="standard-adornment-password"
            type={showPassword ? "text" : "password"}
            value={user.password}
            name="password"
            onChange={handleUserChange}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <button
          className="border-2 py-4 rounded-3xl text-md font-bold bg-dark text-white"
          type="submit"
          onClick={handleSignIn}
        >
          Sign In
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="border-2 py-4 rounded-3xl text-md font-bold bg-white text-dark"
          type="submit"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signin;
