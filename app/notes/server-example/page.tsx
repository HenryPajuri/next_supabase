import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function ServerExamplePage({
  searchParams,
}: {
  searchParams: { edit?: string }
}) {
  const supabase = await createClient()
  const editingId = searchParams.edit ? parseInt(searchParams.edit) : null

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .limit(10)

  async function updateNote(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const id = formData.get('id') as string
    const title = formData.get('title') as string

    await supabase.from('notes').update({ title }).eq('id', id)

    revalidatePath('/notes/server-example')
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
        <h1 className="font-bold text-3xl mb-2">Server Component Example</h1>
        <p className="text-sm text-muted-foreground">
          Server Component with inline editing using URL search params
        </p>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold text-xl mb-4">Your Latest Notes</h2>
        {error ? (
          <p className="text-destructive">Error: {error.message}</p>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 bg-background">
                {editingId === note.id ? (
                  <form action={updateNote} className="flex flex-col gap-4">
                    <input type="hidden" name="id" value={note.id} />
                    <input
                      type="text"
                      name="title"
                      defaultValue={note.title}
                      required
                      className="w-full px-3 py-2 border rounded-md bg-card"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                      >
                        Save
                      </button>
                      <Link
                        href="/notes/server-example"
                        className="border px-4 py-2 rounded-md hover:bg-accent inline-flex items-center"
                      >
                        Cancel
                      </Link>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{note.title}</h3>
                    <Link
                      href={`/notes/server-example?edit=${note.id}`}
                      className="text-primary hover:text-primary/80 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No notes found</p>
        )}
      </div>
    </div>
  )
}
