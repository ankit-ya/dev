import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUp from "./SignUp";
import Login from "./Login";

const AuthComponent = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate(); // ✅ Use React Router for navigation

  const onSignUpSuccess = (userType) => {
    if (userType === "employer") {
      navigate("/employer-dashboard");
    } else {
      navigate("/employee-dashboard");
    }
  };

  const onLoginSuccess = (userType) => {
    if (userType === "employer") {
      navigate("/employer-dashboard");
    } else {
      navigate("/employee-dashboard");
    }
  };

  return (
    <div>
      {isLoginView ? (
        <Login onLoginSuccess={onLoginSuccess} setIsLoginView={setIsLoginView} />
      ) : (
        <SignUp onSignUpSuccess={onSignUpSuccess} setIsLoginView={setIsLoginView} />
      )}
    </div>
  );
};

export default AuthComponent;