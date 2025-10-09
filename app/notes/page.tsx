'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Note = {
  id: number
  title: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select()
      .order('id', { ascending: false })

    if (error) {
      setMessage(`Error fetching notes: ${error.message}`)
    } else {
      setNotes(data || [])
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setMessage('Please enter a title')
      return
    }

    const { error } = await supabase
      .from('notes')
      .insert({ title })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Note created successfully!')
      setTitle('')
      fetchNotes()
    }
  }

  const deleteNote = async (id: number) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage(`Error deleting note: ${error.message}`)
    } else {
      setMessage('Note deleted successfully!')
      fetchNotes()
    }
  }

  const updateNote = async (id: number) => {
    if (!editTitle.trim()) {
      setMessage('Please enter a title')
      return
    }

    const { error } = await supabase
      .from('notes')
      .update({ title: editTitle })
      .eq('id', id)

    if (error) {
      setMessage(`Error updating note: ${error.message}`)
    } else {
      setMessage('Note updated successfully!')
      setEditingId(null)
      setEditTitle('')
      fetchNotes()
    }
  }

  const handleEdit = (id: number, currentTitle: string) => {
    setEditingId(id)
    setEditTitle(currentTitle)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="font-bold text-3xl mb-2">Notes</h1>
        <p className="text-sm text-muted-foreground">
          Client Component example - Data fetching and mutations with full CRUD
        </p>
        <div className="flex gap-4 mt-4">
          <Link
            href="/notes/server-example"
            className="text-sm px-4 py-2 border rounded-md hover:bg-accent"
          >
            Server Component Example →
          </Link>
          <Link
            href="/notes/client-example"
            className="text-sm px-4 py-2 border rounded-md hover:bg-accent"
          >
            Client Component Example →
          </Link>
        </div>
      </div>

      {message && (
        <div className="border rounded-lg p-4 bg-accent text-accent-foreground">
          {message}
        </div>
      )}

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold text-xl mb-4">Create New Note</h2>
        <form onSubmit={createNote} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="Enter note title"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Add Note
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl">Your Notes</h2>
        {notes && notes.length > 0 ? (
          <div className="grid gap-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-6 bg-card">
                {editingId === note.id ? (
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateNote(note.id)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="border px-4 py-2 rounded-md hover:bg-accent"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{note.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(note.id, note.title)}
                        className="text-primary hover:text-primary/80 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-destructive hover:text-destructive/80 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No notes yet. Create your first note above!</p>
        )}
      </div>
    </div>
  )
}
