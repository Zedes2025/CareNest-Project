import { useNavigate } from "react-router";

export function DocBtn() {
  const navigate = useNavigate();

  const handleClick = () => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) navigate("/documents");
    else {
      navigate("/login");
      alert("Please log in to access your documents.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-14 left-8 z-[9999] btn btn-ai btn-circle"
    >
      📁
    </button>
  );
}
