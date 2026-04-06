'use client'

import { useState, useEffect, useCallback } from 'react'
import { Meeting, SummaryResult } from '../../types'

export default function History() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [userId] = useState('demo-user') // For demo purposes

  const fetchMeetings = useCallback(async () => {
    try {
      const params = new URLSearchParams({ userId })
      if (search) params.append('search', search)

      const response = await fetch(`/api/meetings?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      }
    } catch (err) {
      console.error('Error fetching meetings:', err)
    } finally {
      setLoading(false)
    }
  }, [search, userId])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const deleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return

    try {
      const response = await fetch(`/api/meetings?id=${meetingId}&userId=${userId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setMeetings(meetings.filter(m => m.id !== meetingId))
        if (selectedMeeting?.id === meetingId) {
          setSelectedMeeting(null)
        }
      }
    } catch (err) {
      console.error('Error deleting meeting:', err)
    }
  }

  const updateTitle = async (meetingId: string, newTitle: string) => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: meetingId, userId, title: newTitle }),
      })
      if (response.ok) {
        setMeetings(meetings.map(m =>
          m.id === meetingId ? { ...m, title: newTitle } : m
        ))
        setEditingTitle('')
      }
    } catch (err) {
      console.error('Error updating meeting:', err)
    }
  }

  const exportMeeting = async (meeting: Meeting, format: 'pdf' | 'docx') => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: meeting.summary,
          format,
          title: meeting.title,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_')}.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Export error:', err)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading meetings...</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Meeting History</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search meetings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Meetings</h2>
          {meetings.length === 0 ? (
            <p className="text-gray-500">No meetings found.</p>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    {editingTitle === meeting.id ? (
                      <input
                        type="text"
                        value={editingTitle === meeting.id ? editingTitle : meeting.title}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={() => updateTitle(meeting.id, editingTitle)}
                        onKeyPress={(e) => e.key === 'Enter' && updateTitle(meeting.id, editingTitle)}
                        className="flex-1 p-1 border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="text-lg font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => setSelectedMeeting(meeting)}
                      >
                        {meeting.title}
                      </h3>
                    )}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingTitle(meeting.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteMeeting(meeting.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(meeting.createdAt).toLocaleDateString()}
                    {meeting.fileName && ` • ${meeting.fileName}`}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    {meeting.summary.summary.short.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedMeeting ? (
            <MeetingDetails
              meeting={selectedMeeting}
              onExport={(format) => exportMeeting(selectedMeeting, format)}
            />
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a meeting to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MeetingDetails({ meeting, onExport }: { meeting: Meeting; onExport: (format: 'pdf' | 'docx') => void }) {
  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{message: string, response: string}>>([])
  const [chatLoading, setChatLoading] = useState(false)

  const handleChat = async () => {
    if (!chatMessage.trim()) return

    setChatLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          message: chatMessage,
          userId: 'demo-user'
        }),
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
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">{meeting.title}</h2>
        <div className="flex gap-2">
          <button onClick={() => onExport('pdf')} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
            PDF
          </button>
          <button onClick={() => onExport('docx')} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
            DOCX
          </button>
          <button onClick={() => setShowChat(!showChat)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
            💬 Chat
          </button>
        </div>
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

      <MeetingSummaryDisplay summary={meeting.summary} />
    </div>
  )
}

function MeetingSummaryDisplay({ summary }: { summary: SummaryResult }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Short Summary</h4>
            <p className="text-gray-700">{summary.summary.short}</p>
          </div>
          <div>
            <h4 className="font-medium">Detailed Summary</h4>
            <p className="text-gray-700">{summary.summary.detailed}</p>
          </div>
        </div>
      </div>

      {summary.sentiment && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Sentiment</h3>
          <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-lg font-semibold">
            {summary.sentiment}
          </span>
        </div>
      )}

      {summary.speakers && summary.speakers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Speakers</h3>
          <div className="space-y-2">
            {summary.speakers.map((speaker, index) => (
              <div key={index} className="border border-gray-200 p-3 rounded">
                <p className="font-medium">{speaker.name}:</p>
                <p className="text-gray-700">{speaker.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {summary.keywords.map((keyword, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Action Items</h3>
        <ul className="space-y-2">
          {summary.actionItems.map((item, index) => (
            <li key={index} className="border border-gray-200 p-3 rounded">
              <p className="font-medium">{item.task}</p>
              {item.responsible && <p className="text-sm text-gray-600">👤 Responsible: {item.responsible}</p>}
              {item.deadline && <p className="text-sm text-gray-600">📅 Deadline: {item.deadline}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Key Sentences</h3>
        <ul className="space-y-2">
          {summary.keySentences.map((sentence, index) => (
            <li key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              {sentence}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}