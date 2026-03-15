import { useState, useRef, useEffect } from "react";
import {
  extractPdfText,
  extractDocxText,
  extractTxtText,
  speakMessage,
  stopPlayback,
  resumePlayback,
} from "../components/DocComponents";

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
  loading?: boolean; // optional field to indicate if the document is still being processed by the AI
};

function fileToBase64(file: File): Promise<string> {
  // helper function to convert file to base64 string
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); // create a new FileReader to read the file

    reader.readAsDataURL(file); // read the file as a data URL (base64)

    reader.onload = () => resolve(reader.result as string); // when reading is done, resolve the promise with the base64 string
    reader.onerror = reject; // if there's an error, reject the promise
  });
}

export function Documents() {
  const [myDocs, setMyDocs] = useState<MyDoc[]>([]);

  const [file, setFile] = useState<File | null>(null); // State to keep track of the selected file
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null); // State to keep track of the currently selected document summary
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref to directly access the file input element in the DOM, needed to clear it after upload
  //Load saved documents on mount
  useEffect(() => {
    const saved = localStorage.getItem("myDocuments");
    if (saved) {
      setMyDocs(JSON.parse(saved));
    }
  }, []);
  const handleUpload = async () => {
    // Handler for the Upload button
    if (!file) return;

    const base64 = await fileToBase64(file); // Convert file to Base64 as string

    //extarct text from the file (for AI processing later):
    let textContent = "";

    if (file.type === "application/pdf") {
      // if it's a PDF
      textContent = await extractPdfText(file);
    } else if (
      // if it's a Word doc
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      textContent = await extractDocxText(file);
    } else if (file.type === "text/plain") {
      // txt files
      textContent = await extractTxtText(file);
    } else {
      console.log("Unsupported file type:", file.type);
    }

    console.log(file.type);
    console.log("Extracted text content:", textContent);

    // Update State immediately using the functional update, tempo before ai response comes back
    // Stage 1: temporary document before AI response
    const tempDoc: MyDoc = {
      id: crypto.randomUUID(), // to have a unique id for the document in the frontend before we get the real ID
      name: file.name,
      file: base64,
      summary: "Processing...",
      loading: true, // indicate that this document is still being processed by the AI
    };

    setMyDocs((prev) => {
      const updated = [...prev, tempDoc];
      localStorage.setItem("myDocuments", JSON.stringify(updated));
      return updated;
    });

    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    alert("File uploaded successfully!");

    const accessToken = localStorage.getItem("accessToken");

    const res = await fetch(baseURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        fileName: file.name,
        text: textContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.message || "Failed to send connection request.";
      throw new Error(errorMessage);
    }

    console.log("Summary from AI server:", data);

    // Update the document in the state with the summary and the ID from the database
    // we use the base64 string to identify which document to update. state update:

    // Stage 2: update document with summary and id
    setMyDocs((prev: MyDoc[]) =>
      prev.map((doc: MyDoc) =>
        doc.id === tempDoc.id // Match by the UUID we just made
          ? {
              ...doc,
              summary: data.summary,
              deadline: data.deadline ?? null,
              actionRequired: data.actionRequired ?? null,
              id: data._id,
              loading: false, // AI processing is done, we can set loading to false
            }
          : doc,
      ),
    );

    const savedDocs: MyDoc[] = JSON.parse(
      localStorage.getItem("myDocuments") || "[]",
    ) as MyDoc[];

    const updatedDocs: MyDoc[] = savedDocs.map((doc: MyDoc) =>
      doc.id === tempDoc.id
        ? {
            ...doc,
            summary: data.summary,
            deadline: data.deadline ?? null,
            actionRequired: data.actionRequired ?? null,
            id: data._id,
            loading: false, // AI processing is done, we can set loading to false
          }
        : doc,
    );

    localStorage.setItem("myDocuments", JSON.stringify(updatedDocs));
  };
  // allow clicking on them to see details / call AI server with document content

  const handleDelete = async (id: string) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found. User might not be logged in.");
      return;
    }

    //  Immediately update UI and localStorage
    setMyDocs((prev) => prev.filter((doc) => doc.id !== id));

    const savedDocs: MyDoc[] = JSON.parse(
      localStorage.getItem("myDocuments") || "[]",
    );
    localStorage.setItem(
      "myDocuments",
      JSON.stringify(savedDocs.filter((doc) => doc.id !== id)),
    );

    try {
      //  Send DELETE request to server
      const res = await fetch(`${baseURL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        let errorMsg = `Delete failed with status ${res.status}`;
        try {
          const errorData = await res.json();
          if (errorData?.message) errorMsg += `: ${errorData.message}`;
        } catch (_) {}
        console.error(errorMsg);

        return;
      }

      console.log(`Document ${id} successfully deleted on server.`);
    } catch (err) {
      console.error("Delete request failed:", err);
      // optional: rollback UI/localStorage if needed
    }
  };

  return (
    <div className="p-4">
      {/* Page header with title and description */}
      <h1 className="flex flex-col gap-2 p-6 font-bold mb-4 bg-blue-200 rounded-2xl w-full">
        Doc Analyser Bot
        <span className="text-sm font-normal text-gray-600">
          Upload your documents and let our AI analyze them for you!
        </span>
      </h1>

      {/* File upload section */}
      <fieldset className="fieldset flex flex-row gap-4 mt-4">
        <legend className="fieldset-legend">Upload a file</legend>

        {/* File input element */}
        <input
          type="file"
          className="file-input"
          ref={fileInputRef} // attach ref so that it can be cleared  later
          onChange={(e) => setFile(e.target.files?.[0] || null)} // store selected file in state
        />

        {/* <label className="label">Max size 2MB</label> */}

        {/* Upload button */}
        <button
          className="btn btn-primary mt-2"
          onClick={handleUpload} // call handler when clicked
          disabled={!file} // disabled until a file is selected
        >
          Upload
        </button>
      </fieldset>
      {/* show selected file name */}
      {file && <p className="text-sm mt-2">Selected: {file.name}</p>}
      <h1 className="text-xl font-bold mb-4">My Documents</h1>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {myDocs.map((doc) => (
          <div
            key={doc.id}
            className="border p-2 rounded flex flex-col h-full" // add flex and h-full
          >
            {doc.loading && (
              <p className="text-sm text-blue-500 animate-pulse">
                Analyzing...
              </p>
            )}
            <div className="flex-1">
              {/* if deadline/action exist, show them in card*/}
              <p className="font-semibold">{doc.name}</p>
              {doc.deadline && (
                <p className="text-sm text-red-500">Deadline: {doc.deadline}</p>
              )}
              {doc.actionRequired && (
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
          </div>
        ))}
      </div>
      {/* Modal to show the selected document summary, appears when a summary is selected and can be closed with a button */}
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
