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
