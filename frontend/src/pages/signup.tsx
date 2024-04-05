import React from "react";
import { useNavigate } from "react-router-dom";
import SignUp from "../assets/signup.png";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material";
import { baseUrl } from "../urls";

function Signup() {
  const navigate = useNavigate();

  const [user, setUser] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    rePassword: "",
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showRePassword, setShowRePassword] = React.useState(false);
  const [contact, setContact] = React.useState("");

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleContactChange = (event: SelectChangeEvent<string>) => {
    setContact(event.target.value);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowRePassword = () => setShowRePassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseDownRePassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, password, rePassword } = user;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !rePassword ||
      password !== rePassword
    ) {
      return alert("Please fill in all the fields");
    }

    const response = await fetch(`${baseUrl}/api/v1/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        return alert("Registration failed");
      }
    }
    alert("User registered");
    navigate("/verify", { state: { email } })
  };

  return (
    <div className="flex items-center justify-center">
      <img
        className="hidden md:block lg:block"
        src={SignUp}
        alt="signin"
        style={{ width: "740px" }}
      />
      <form className="flex flex-col gap-4 border rounded-2xl mt-7 md:mt-0 lg:mt-0 px-10 py-5">
        <div className="flex items-center gap-10">
          <h1 className="text-dark text-4xl font-extrabold">
            Let us know <span className="text-red">!</span>
          </h1>
          <p
            onClick={() => navigate("/signin")}
            className="text-lg font-bold text-dark underline cursor-pointer"
          >
            Sign <span className="text-red">In</span>
          </p>
        </div>
        <TextField
          sx={{ m: 1, width: "100%" }}
          id="standard-basic"
          label="First Name"
          variant="standard"
          name="firstName"
          value={user.firstName}
          onChange={handleUserChange}
        />
        <TextField
          sx={{ m: 1, width: "100%" }}
          id="standard-basic"
          label="Last Name"
          variant="standard"
          name="lastName"
          value={user.lastName}
          onChange={handleUserChange}
        />
        <FormControl sx={{ m: 1, width: "100%" }} variant="standard">
          <InputLabel htmlFor="standard-adornment-password">
            Set Password
          </InputLabel>
          <Input
            id="standard-adornment-password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={user.password}
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
        <FormControl sx={{ m: 1, width: "100%" }} variant="standard">
          <InputLabel htmlFor="standard-adornment-password">
            Retype Password
          </InputLabel>
          <Input
            id="standard-adornment-password"
            type={showRePassword ? "text" : "password"}
            name="rePassword"
            value={user.rePassword}
            onChange={handleUserChange}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowRePassword}
                  onMouseDown={handleMouseDownRePassword}
                >
                  {showRePassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl variant="standard" sx={{ m: 1, width: "100%" }}>
          <InputLabel id="demo-simple-select-standard-label">
            Contact Mode
          </InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={contact}
            onChange={handleContactChange}
            label="Contact Mode"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="Email">Email</MenuItem>
          </Select>
        </FormControl>
        <TextField
          sx={{ m: 1, width: "100%" }}
          id="standard-basic"
          label="Email"
          variant="standard"
          name="email"
          value={user.email}
          onChange={handleUserChange}
        />
        <button
          className="border-2 py-4 rounded-3xl text-md font-bold bg-dark text-white"
          type="submit"
          onClick={(e: React.FormEvent) => {
            handleSignUp(e);
          }}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
