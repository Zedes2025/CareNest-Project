import { authServiceURL } from "../utils/index";
import { redirect } from "react-router";
import { useState, useRef, useEffect } from "react";
import {
  extractPdfText,
  extractDocxText,
  extractTxtText,
  speakMessage,
  stopPlayback,
  resumePlayback,
} from "../components/DocComponents";
import { useLoaderData } from "react-router";

const AI_SERVER_URL = import.meta.env.VITE_AI_SERVER_URL;
if (!AI_SERVER_URL)
  throw new Error("AI_SERVER_URL is required, are you missing a .env file?");
const baseURL = `${AI_SERVER_URL}/ai/docs`;

type MyDoc = {
  id?: string;
  name: string;
  file: string;
  summary?: string;
  deadline?: string;
  actionRequired?: string;
  loading?: boolean;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

// Loader for Documents page
export const documentsLoader = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) return redirect("/login");

  const res = await fetch(`${authServiceURL}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return redirect("/login");

  const { user } = await res.json();
  return user;
};

export function Documents() {
  const currentUser = useLoaderData() as { id: string; name: string } | null;

  if (!currentUser)
    return <p className="text-gray-500">Loading user data...</p>;

  const savedDocsKey = `myDocuments_${currentUser.id}`;

  const [myDocs, setMyDocs] = useState<MyDoc[]>([]);
  const [uploadErr, setUploadErr] = useState<{ [key: string]: string[] }>({});
  const [deleteErr, setDeleteErr] = useState<{ [docId: string]: string }>({});
  const [file, setFile] = useState<File | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load documents for current user
  useEffect(() => {
    const saved = localStorage.getItem(savedDocsKey);
    if (saved) setMyDocs(JSON.parse(saved));
  }, [savedDocsKey]);

  const handleUpload = async () => {
    if (!file) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Session expired. Please login again.");
      return;
    }

    const base64 = await fileToBase64(file);

    let textContent = "";
    if (file.type === "application/pdf")
      textContent = await extractPdfText(file);
    else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
      textContent = await extractDocxText(file);
    else if (file.type === "text/plain")
      textContent = await extractTxtText(file);
    else {
      setUploadErr({ fileName: [`Unsupported file type: ${file.type}`] });
      return;
    }

    const res = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ fileName: file.name, text: textContent }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.errors) setUploadErr(data.errors);
      else setUploadErr({ general: [data.message || "Something went wrong"] });
      return;
    }

    setUploadErr({});

    // Stage 1: temporary doc
    const tempDoc: MyDoc = {
      id: crypto.randomUUID(),
      name: file.name,
      file: base64,
      summary: "Processing...",
      loading: true,
    };

    const updatedTempDocs = [...myDocs, tempDoc];
    setMyDocs(updatedTempDocs);
    localStorage.setItem(savedDocsKey, JSON.stringify(updatedTempDocs));

    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Stage 2: update with real data
    const updatedDocs = updatedTempDocs.map((doc) =>
      doc.id === tempDoc.id
        ? {
            ...doc,
            summary: data.summary,
            deadline: data.deadline ?? null,
            actionRequired: data.actionRequired ?? null,
            id: data._id,
            loading: false,
          }
        : doc,
    );

    setMyDocs(updatedDocs);
    localStorage.setItem(savedDocsKey, JSON.stringify(updatedDocs));

    alert("File uploaded successfully!");
  };

  const handleDelete = async (id: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setDeleteErr((prev) => ({
        ...prev,
        [id]: "No access token. Login required.",
      }));
      return;
    }

    const res = await fetch(`${baseURL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    let data: any = {};
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {}
    }

    if (!res.ok) {
      setDeleteErr((prev) => ({
        ...prev,
        [id]:
          data.errors?.id?.[0] ||
          data.message ||
          `Delete failed (${res.status})`,
      }));
      return;
    }

    const filteredDocs = myDocs.filter((doc) => doc.id !== id);
    setMyDocs(filteredDocs);

    const savedDocs: MyDoc[] = JSON.parse(
      localStorage.getItem(savedDocsKey) || "[]",
    );
    localStorage.setItem(
      savedDocsKey,
      JSON.stringify(savedDocs.filter((doc) => doc.id !== id)),
    );

    setDeleteErr((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className="p-4">
      <h1 className="flex flex-col gap-2 p-6 font-bold mb-4 bg-blue-200 rounded-2xl w-full">
        Doc Analyser Bot
        <span className="text-sm font-normal text-gray-600">
          Upload your documents and let our AI analyze them for you!
        </span>
      </h1>

      <fieldset className="fieldset flex flex-row gap-4 mt-4">
        <legend className="fieldset-legend">Upload a file</legend>
        <input
          type="file"
          className="file-input"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </button>
      </fieldset>

      {uploadErr.fileName?.map((msg, i) => (
        <p key={i} className="text-red-500 mt-2">
          {msg}
        </p>
      ))}
      {uploadErr.text?.map((msg, i) => (
        <p key={i} className="text-red-500 mt-2">
          {msg}
        </p>
      ))}
      {uploadErr.general?.map((msg, i) => (
        <p key={i} className="text-red-500 mt-2">
          {msg}
        </p>
      ))}

      {file && <p className="text-sm mt-2">Selected: {file.name}</p>}

      <h1 className="text-xl font-bold mb-4">My Documents</h1>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {myDocs.map((doc) => (
          <div key={doc.id} className="border p-2 rounded flex flex-col h-full">
            {doc.loading && (
              <p className="text-sm font-bold text-gray-500 animate-pulse">
                Analyzing...
              </p>
            )}
            <div className="flex-1">
              <p className="font-semibold">{doc.name}</p>
              {doc.deadline && doc.deadline !== "null" && (
                <p className="text-sm text-red-500">Deadline: {doc.deadline}</p>
              )}
              {doc.actionRequired && doc.actionRequired !== "null" && (
                <p className="text-sm text-green-700">
                  Action: {doc.actionRequired}
                </p>
              )}
            </div>

            <div className="mt-2">
              <button
                className="btn btn-sm btn-primary mt-1 p-2"
                onClick={() => window.open(doc.file, "_blank")}
              >
                Open
              </button>
              <button
                className="btn btn-sm btn-active m-1 ml-2 p-2 hover:bg-gray-300"
                disabled={!doc.summary}
                onClick={() => setSelectedSummary(doc.summary || "")}
              >
                View Summary
              </button>
              <div className="inline-block bg-orange-200 rounded px-1 py-0 ml-0">
                <button
                  onClick={() => speakMessage(doc.summary || "")}
                  className="inline-flex items-center justify-center h-8 text-lg opacity-70 hover:opacity-100 rounded"
                >
                  ▶️
                </button>
                <button
                  onClick={() => stopPlayback()}
                  className="inline-flex items-center justify-center h-8 text-lg opacity-70 hover:opacity-100 rounded"
                >
                  ⏸️
                </button>
                <button
                  onClick={() => resumePlayback()}
                  className="inline-flex items-center justify-center h-8 text-lg opacity-70 hover:opacity-100 rounded"
                >
                  ⏯️
                </button>
              </div>
              <button
                className="btn btn-sm btn-active m-1 ml-2 p-2 hover:bg-gray-300"
                onClick={() => handleDelete(doc.id!)}
              >
                Delete
              </button>
            </div>
            {doc.id && deleteErr[doc.id] && (
              <p className="text-red-500 mt-1">{deleteErr[doc.id]}</p>
            )}
          </div>
        ))}
      </div>

      {selectedSummary && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-lg">
            <h2 className="text-lg font-bold mb-2">Summary</h2>
            <p className="text-sm">{selectedSummary}</p>
            <button
              className="btn btn-sm btn-primary mt-4"
              onClick={() => setSelectedSummary(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
