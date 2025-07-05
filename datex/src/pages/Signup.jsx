import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi"; // eye icons

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSignup = async () => {
    if (!email || !password) {
      return setError("Please fill in all fields.");
    }

    if (!validateEmail(email)) {
      return setError("Enter a valid email address.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      setError("");
      setLoading(true);
      await register(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      // Show specific Firebase error
      const msg = err.message;

      if (msg.includes("email-already-in-use")) {
        setError("This email is already registered.");
      } else if (msg.includes("invalid-email")) {
        setError("Invalid email format.");
      } else if (msg.includes("weak-password")) {
        setError("Password is too weak.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setError("");
      setLoading(true);
      await googleLogin();
      navigate("/dashboard");
    } catch (err) {
      setError("Google signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6 shadow-lg border border-gray-400 rounded-md">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          Date<span className="text-black">X</span>
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center font-medium">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex border rounded focus:outline-none">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-2 pr-10 border-none rounded focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Eye Icon */}
          <div
            className=" my-3 cursor-pointer text-gray-600 px-2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Signup"}
        </button>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-2 font-semibold rounded hover:bg-blue-100 disabled:opacity-60"
        >
          {loading ? (
            "Please wait..."
          ) : (
            <div className="h-fit  flex justify-center gap-2 align-middle">
              <span>
                <FcGoogle className=" text-2xl m-auto" />
              </span>
              Sign up with Google
            </div>
          )}
        </button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
