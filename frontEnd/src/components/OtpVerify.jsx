import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const VerifyOtpPage = ({ email, onClose }) => {
  const [otp, setOtp] = useState("");
  const { verifyOtp, isVerifying } = useAuthStore();

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      return toast.error("Enter valid 6-digit OTP");
    }

    const res = await verifyOtp({ email, otp });

    if (res?.success) {
      onClose(); 
    }
  };

  return (
    <dialog className="modal modal-open backdrop-blur-sm">
      <div className="modal-box max-w-md">

        <div className="text-center mb-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold">Verify Email</h2>
          <p className="text-sm text-base-content/60">
            OTP sent to {email}
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="input input-bordered w-full text-center text-lg tracking-widest mb-4"
          />

          <button className="btn btn-primary w-full" disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Loader2 className="animate-spin size-5" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </dialog>
  );
};

export default VerifyOtpPage;