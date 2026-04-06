import mammoth from 'mammoth';

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;

  if (fileType === 'text/plain') {
    return await file.text();
  }

  if (fileType === 'application/pdf') {
    // For now, return a message that PDF processing is coming soon
    // TODO: Implement PDF text extraction
    throw new Error('PDF processing is currently not available. Please paste the text directly or use a .txt or .docx file.');
  }

  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}