import pdfToText from "react-pdftotext";
import * as mammoth from "mammoth";

// extract text from pdf file , only native pdfs (not scanned images)
export async function extractPdfText(file: File): Promise<string> {
  try {
    const text = await pdfToText(file);
    return text;
  } catch (error) {
    console.error("PDF text extraction failed:", error);
    return "";
  }
}

// extract text from docx file
export async function extractDocxText(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
}

// extract text from txt file
export async function extractTxtText(file: File) {
  return await file.text();
}

export function speakMessage(text: string) {
  // function to read aloud a message using Web Speech API
  if (!text) return;
  window.speechSynthesis.cancel(); // Clear any stuck queue or previous speech

  window.speechSynthesis.resume(); // Force a resume in case the engine was left in a paused state

  const textToSpeech = new SpeechSynthesisUtterance(text);

  speechSynthesis.speak(textToSpeech);
}
export function stopPlayback() {
  speechSynthesis.pause();
}
export function resumePlayback() {
  speechSynthesis.resume();
}
