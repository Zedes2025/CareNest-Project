import { useNavigate } from "react-router";

export function DocBtn() {
  const navigate = useNavigate();

  const handleClick = () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      alert("Please login to access your documents.");
      return;
    }

    navigate("/documents");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-14 left-8 z-[9999] btn btn-primary btn-circle"
    >
      📁
    </button>
  );
}
