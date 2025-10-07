import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ServerExamplePage() {
  const supabase = await createClient()

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .limit(10)

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
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold text-xl mb-4">Your Latest Notes</h2>
        {error ? (
          <p className="text-destructive">Error: {error.message}</p>
        ) : notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border-l-2 border-primary pl-4">
                <h3 className="font-medium">{note.title}</h3>
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
