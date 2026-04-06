'use client'

import { useState } from 'react'
import { SummaryResult } from '../types'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('demo-user') // For demo purposes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    } else if (text) {
      formData.append('text', text)
    } else {
      setError('Please provide text or upload a file')
      setLoading(false)
      return
    }

    formData.append('userId', userId)
    formData.append('title', title || 'Meeting Notes')

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process meeting notes')
      }

      const data: SummaryResult = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!result) return

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: result,
          format,
          title: title || 'Meeting Summary',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate export')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'meeting-summary'}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export file')
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Meeting Notes</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Meeting Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter meeting title..."
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Upload File</label>
          <input
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <p className="text-sm text-gray-500 mt-1">Supported formats: .txt, .pdf, .docx</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Or Paste Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your meeting notes here..."
            className="w-full p-2 border border-gray-300 rounded h-32"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Process Meeting'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {result && <ResultsDisplay result={result} onExport={handleExport} title={title} />}
    </div>
  )
}

function ResultsDisplay({ result, onExport, title }: { result: SummaryResult; onExport: (format: 'pdf' | 'docx') => void; title: string }) {
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{message: string, response: string}>>([])
  const [chatLoading, setChatLoading] = useState(false)

  const handleChat = async () => {
    if (!chatMessage.trim()) return

    setChatLoading(true)
    try {
      // For demo purposes, we'll simulate a meeting ID
      const meetingId = 'demo-meeting-id'
      const userId = 'demo-user'

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, message: chatMessage, userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setChatHistory([...chatHistory, { message: chatMessage, response: data.response }])
        setChatMessage('')
      }
    } catch (err) {
      console.error('Chat error:', err)
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => onExport('pdf')}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Download PDF
        </button>
        <button
          onClick={() => onExport('docx')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Download DOCX
        </button>
        <button
          onClick={() => setShowChat(!showChat)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          💬 Chat with Meeting
        </button>
      </div>

      {showChat && (
        <div className="border border-gray-300 rounded p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Chat with Meeting</h3>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {chatHistory.map((chat, index) => (
              <div key={index} className="space-y-2">
                <div className="bg-blue-100 p-2 rounded">
                  <strong>You:</strong> {chat.message}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <strong>AI:</strong> {chat.response}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question about the meeting..."
              className="flex-1 p-2 border border-gray-300 rounded"
              onKeyPress={(e) => e.key === 'Enter' && handleChat()}
            />
            <button
              onClick={handleChat}
              disabled={chatLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {chatLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-2">Summary</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Short Summary</h4>
            <p className="text-gray-700">{result.summary.short}</p>
          </div>
          <div>
            <h4 className="font-medium">Detailed Summary</h4>
            <p className="text-gray-700">{result.summary.detailed}</p>
          </div>
          {result.translatedSummary && result.language !== 'en' && (
            <div>
              <h4 className="font-medium">English Translation</h4>
              <p className="text-gray-700">{result.translatedSummary.short}</p>
            </div>
          )}
        </div>
      </div>

      {result.sentiment && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Sentiment</h3>
          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-lg font-semibold">
            {result.sentiment}
          </span>
        </div>
      )}

      {result.speakers && result.speakers.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Speakers</h3>
          <div className="space-y-2">
            {result.speakers.map((speaker, index) => (
              <div key={index} className="border border-gray-200 p-3 rounded">
                <p className="font-medium">{speaker.name}:</p>
                <p className="text-gray-700">{speaker.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-2">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {result.keywords.map((keyword, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Action Items</h3>
        <ul className="space-y-2">
          {result.actionItems.map((item, index) => (
            <li key={index} className="border border-gray-200 p-3 rounded">
              <p className="font-medium">{item.task}</p>
              {item.responsible && <p className="text-sm text-gray-600">👤 Responsible: {item.responsible}</p>}
              {item.deadline && <p className="text-sm text-gray-600">📅 Deadline: {item.deadline}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Key Sentences</h3>
        <ul className="space-y-2">
          {result.keySentences.map((sentence, index) => (
            <li key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              {sentence}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}