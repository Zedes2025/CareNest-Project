import { useState } from "react";
import { authServiceURL } from "../../utils";
export function ChangePassBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // ✅ Validate FIRST
    if (!currentPassword || !newPassword) {
      alert("Please fill both fields.");
      return;
    }

    if (currentPassword === newPassword) {
      alert("New password must be different from current password.");
      return;
    }

    try {
      setLoading(true);

      const accessToken = localStorage.getItem("accessToken");

      const res = await fetch(`${authServiceURL}/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to change password.");
        return;
      }

      alert("Password changed successfully!");

      //  Reset
      setCurrentPassword("");
      setNewPassword("");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="ml-2 btn btn-primary px-6 py-3 text-lg font-semibold w-60 justify-center"
      >
        Change Password
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>

            <div className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="Current Password"
                className="input input-bordered w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="New Password"
                className="input input-bordered w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                onClick={handleSave}
                className="btn btn-primary w-full mt-2"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="btn w-full mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
