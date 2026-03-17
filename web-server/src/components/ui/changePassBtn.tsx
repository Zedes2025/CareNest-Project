import { useState } from "react";

export function ChangePassBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSave = () => {
    // Replace this with real password change logic (API call)
    console.log("Current Password:", currentPassword);
    console.log("New Password:", newPassword);

    // Simple validation example
    if (!currentPassword || !newPassword) {
      alert("Please fill both fields.");
      return;
    }

    alert("Password change submitted!");
    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setIsOpen(false);
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="ml-2 btn btn-primary px-6 py-3 text-lg font-semibold w-60 justify-end"
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
              >
                Save
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
