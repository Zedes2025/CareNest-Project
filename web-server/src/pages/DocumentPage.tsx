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

export const documentsLoader = async () => {
  const accessToken = localStorage.getItem("accessToken");

  // 1. Check local storage
  if (!accessToken) {
    throw redirect("/login");
  }

  try {
    const res = await fetch(`${authServiceURL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 2. Check if the token is actually valid/expired
    if (!res.ok) {
      localStorage.removeItem("accessToken"); // Clean up dead tokens
      throw redirect("/login");
    }

    const { user } = await res.json();
    return user;
  } catch (error) {
    // 3. Handle network errors (also prevents white page)
    throw redirect("/login");
  }
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
    <div className="flex-1 bg-cover bg-center bg-fixed">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#E6D9B5] border border-[#B39474] p-6">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h1 className="text-2xl font-bold">
                Doc Analyser Bot
                <span className="block mt-1 text-sm font-normal opacity-70">
                  Upload your documents and let our AI analyze them for you!
                </span>
              </h1>

              <fieldset className="fieldset mt-6">
                <legend className="fieldset-legend">Upload a file</legend>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="file"
                    className="file-input w-full sm:max-w-xs"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />

                  <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!file}
                    type="button"
                  >
                    Upload
                  </button>
                </div>

                {file && (
                  <p className="text-sm mt-2 opacity-70">
                    Selected: {file.name}
                  </p>
                )}
              </fieldset>

              {uploadErr.fileName?.map((msg, i) => (
                <p key={i} className="text-error mt-2">
                  {msg}
                </p>
              ))}
              {uploadErr.text?.map((msg, i) => (
                <p key={i} className="text-error mt-2">
                  {msg}
                </p>
              ))}
              {uploadErr.general?.map((msg, i) => (
                <p key={i} className="text-error mt-2">
                  {msg}
                </p>
              ))}

              <h2 className="text-xl font-bold mt-8">My Documents</h2>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myDocs.map((doc) => (
                  <div key={doc.id} className="card bg-base-100 shadow border">
                    <div className="card-body p-4">
                      {doc.loading && (
                        <p className="text-sm font-bold opacity-70 animate-pulse">
                          Analyzing...
                        </p>
                      )}

                      <div className="flex-1">
                        <p className="font-semibold">{doc.name}</p>

                        {doc.deadline && doc.deadline !== "null" && (
                          <p className="text-sm text-error mt-1">
                            Deadline: {doc.deadline}
                          </p>
                        )}

                        {doc.actionRequired &&
                          doc.actionRequired !== "null" && (
                            <p className="text-sm mt-1">
                              <span className="font-semibold">Action:</span>{" "}
                              {doc.actionRequired}
                            </p>
                          )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => window.open(doc.file, "_blank")}
                          type="button"
                        >
                          Open
                        </button>

                        <button
                          className="btn btn-sm btn-outline"
                          disabled={!doc.summary}
                          onClick={() => setSelectedSummary(doc.summary || "")}
                          type="button"
                        >
                          View Summary
                        </button>

                        <div className="inline-flex items-center gap-1 rounded-xl border border-[#B39474] px-2 py-1">
                          <button
                            onClick={() => speakMessage(doc.summary || "")}
                            className="btn btn-ghost btn-xs"
                            type="button"
                            title="Play"
                          >
                            ▶️
                          </button>
                          <button
                            onClick={() => stopPlayback()}
                            className="btn btn-ghost btn-xs"
                            type="button"
                            title="Pause"
                          >
                            ⏸️
                          </button>
                          <button
                            onClick={() => resumePlayback()}
                            className="btn btn-ghost btn-xs"
                            type="button"
                            title="Resume"
                          >
                            ⏯️
                          </button>
                        </div>

                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleDelete(doc.id!)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>

                      {doc.id && deleteErr[doc.id] && (
                        <p className="text-error mt-2">{deleteErr[doc.id]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedSummary && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4">
                  <div className="card bg-base-100 shadow w-full max-w-lg">
                    <div className="card-body">
                      <h3 className="text-lg font-bold">Summary</h3>
                      <p className="text-sm opacity-80 whitespace-pre-line">
                        {selectedSummary}
                      </p>
                      <div className="card-actions justify-end mt-4">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedSummary(null)}
                          type="button"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
