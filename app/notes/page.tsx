import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function NotesPage() {
  const supabase = await createClient()

  const { data: notes } = await supabase
    .from('notes')
    .select()

  async function createNote(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const title = formData.get('title') as string

    await supabase.from('notes').insert({ title })

    revalidatePath('/notes')
  }

  async function deleteNote(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const id = formData.get('id') as string

    await supabase.from('notes').delete().eq('id', id)
    revalidatePath('/notes')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="font-bold text-3xl mb-2">Notes</h1>
        <p className="text-sm text-muted-foreground">
          Server Component example - Data fetching and mutations using Server Actions
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

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold text-xl mb-4">Create New Note</h2>
        <form action={createNote} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
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
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{note.title}</h3>
                  <form action={deleteNote}>
                    <input type="hidden" name="id" value={note.id} />
                    <button
                      type="submit"
                      className="text-destructive hover:text-destructive/80 text-sm"
                    >
                      Delete
                    </button>
                  </form>
                </div>
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
