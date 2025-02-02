import { Button } from "@/components/ui/button";
import { auth, signInWithGoogle } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import GoogleIcon from "@/components/icons/GoogleIcon";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success("Successfully signed in with Google");
      navigate("/");
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    }
  };

  if (auth.currentUser) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src="/lovable-uploads/4d7af250-4b32-4b97-a895-71998a67213d.png"
              alt="TaskBuddy Logo"
              className="w-12 h-12"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">TaskBuddy</h1>
          <p className="text-lg text-gray-600">
            Streamline your workflow and track progress effortlessly with our
            all-in-one task management app.
          </p>
        </div>

        <Button
          onClick={handleGoogleSignIn}
          className="w-full max-w-sm mx-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-3 h-12"
        >
          <GoogleIcon />
          Continue with Google
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;