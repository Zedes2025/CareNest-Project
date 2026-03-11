import { useState, useRef, useEffect } from "react";

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
  const [myDocs, setMyDocs] = useState<{ name: string; file: string }[]>([]);

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
    setMyDocs((prev) => [...prev, { name: file.name, file: base64 }]); // Add the new document to the list of documents in state

    // TODO: save in local storagesend file to backend / extract text / call AI server here
    const savedDocs = JSON.parse(localStorage.getItem("myDocuments") || "[]"); //save file to local storage (for persistence across refreshes)
    localStorage.setItem(
      "myDocuments",
      JSON.stringify([...savedDocs, { name: file.name, file: base64 }]),
    );
    if (savedDocs) setMyDocs(savedDocs); // Update state with saved documents from local storage (in case there were already some)
    setFile(null); // Clear the file state (disables the Upload button)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the actual file input
    }
    alert("File uploaded successfully!");
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
          <div key={doc.name} className="border p-2 rounded">
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
