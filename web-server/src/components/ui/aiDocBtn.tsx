import { useState } from "react";
import DocAction from "../DocAction";
import { useNavigate } from "react-router";

export function DocBtn() {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate("/documents")}
        className="fixed bottom-8 left-8 z-[9999] btn  btn-primary btn-circle "
      >
        📁
      </button>
    </>
  );
}
