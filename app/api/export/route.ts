import { NextRequest, NextResponse } from 'next/server';
import { SummaryResult } from '../../../types';
import jsPDF from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const { summary, format, title }: { summary: SummaryResult; format: 'pdf' | 'docx'; title: string } = await request.json();

    if (format === 'pdf') {
      return generatePDF(summary, title);
    } else if (format === 'docx') {
      return generateDOCX(summary, title);
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error generating export:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}

function generatePDF(summary: SummaryResult, title: string): NextResponse {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text(title, 20, 30);

  doc.setFontSize(16);
  doc.text('Summary', 20, 50);

  doc.setFontSize(12);
  const shortSummary = doc.splitTextToSize(`Short: ${summary.summary.short}`, 170);
  doc.text(shortSummary, 20, 65);

  let yPos = 65 + shortSummary.length * 5 + 10;
  const detailedSummary = doc.splitTextToSize(`Detailed: ${summary.summary.detailed}`, 170);
  doc.text(detailedSummary, 20, yPos);

  yPos += detailedSummary.length * 5 + 10;
  doc.setFontSize(16);
  doc.text('Keywords', 20, yPos);
  doc.setFontSize(12);
  doc.text(summary.keywords.join(', '), 20, yPos + 10);

  yPos += 25;
  doc.setFontSize(16);
  doc.text('Action Items', 20, yPos);
  doc.setFontSize(12);
  summary.actionItems.forEach((item, index) => {
    const itemText = `${index + 1}. ${item.task}`;
    if (item.responsible) doc.text(`Responsible: ${item.responsible}`, 30, yPos + 15 + index * 20);
    if (item.deadline) doc.text(`Deadline: ${item.deadline}`, 30, yPos + 20 + index * 20);
    doc.text(doc.splitTextToSize(itemText, 160), 20, yPos + 10 + index * 20);
  });

  const pdfBuffer = doc.output('arraybuffer');

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
    },
  });
}

function generateDOCX(summary: SummaryResult, title: string): NextResponse {
  // For now, return a simple text file as DOCX
  // TODO: Implement proper DOCX generation
  let docx = `${title}\n\n`;
  docx += 'Summary\n\n';
  docx += `Short: ${summary.summary.short}\n\n`;
  docx += `Detailed: ${summary.summary.detailed}\n\n`;
  docx += `Keywords: ${summary.keywords.join(', ')}\n\n`;
  docx += 'Action Items\n';
  summary.actionItems.forEach((item, index) => {
    docx += `${index + 1}. ${item.task}\n`;
    if (item.responsible) docx += `Responsible: ${item.responsible}\n`;
    if (item.deadline) docx += `Deadline: ${item.deadline}\n`;
    docx += '\n';
  });

  const buffer = Buffer.from(docx, 'utf-8');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}.docx"`,
    },
  });
}