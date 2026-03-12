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

    console.log("Summary from AI server:", data.summary);

    // Update the document in the state with the summary and the ID from the database
    // we use the base64 string to identify which document to update. state update:

    // Stage 2: update document with summary and id
    setMyDocs((prev: MyDoc[]) =>
      prev.map((doc: MyDoc) =>
        doc.id === tempDoc.id // Match by the UUID we just made
          ? { ...doc, summary: data.summary, id: data._id }
          : doc,
      ),
    );

    const savedDocs: MyDoc[] = JSON.parse(
      localStorage.getItem("myDocuments") || "[]",
    ) as MyDoc[];

    const updatedDocs: MyDoc[] = savedDocs.map((doc: MyDoc) =>
      doc.id === tempDoc.id
        ? { ...doc, summary: data.summary, id: data._id }
        : doc,
    );

    localStorage.setItem("myDocuments", JSON.stringify(updatedDocs));
  };
  // allow clicking on them to see details / call AI server with document content

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
          <div key={doc.id} className="border p-2 rounded">
            {" "}
            <p className="font-semibold">{doc.name}</p>
            <button
              className="btn btn-sm btn-primary mt-1"
              onClick={() => window.open(doc.file, "_blank")}
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
