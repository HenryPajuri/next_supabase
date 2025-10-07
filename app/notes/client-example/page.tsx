'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Note = {
  id: string
  title: string
}

export default function ClientExamplePage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notes')
        .select('*')

      if (error) throw error
      setNotes(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title) return

    try {
      setSubmitting(true)

      const { data, error } = await supabase
        .from('notes')
        .insert({ title })
        .select()
        .single()

      if (error) throw error

  
      setNotes([data, ...notes])
      setTitle('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    const previousNotes = [...notes]
    setNotes(notes.filter(note => note.id !== id))

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err: any) {
      setNotes(previousNotes)
      setError(err.message)
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <Link
          href="/notes"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to Notes
        </Link>
        <h1 className="font-bold text-3xl mb-2">Client Component Example</h1>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold text-xl mb-4">Create Note (Client-Side)</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="Enter note title"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Note'}
          </button>
        </form>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold text-xl mb-4">Your Notes</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading notes...</p>
        ) : notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{note.title}</h3>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-destructive hover:text-destructive/80 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No notes yet. Create one above!</p>
        )}
      </div>
    </div>
  )
}
