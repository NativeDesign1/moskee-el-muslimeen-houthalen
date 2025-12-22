import AdminLayout from './AdminLayout';

export default function ActivitiesManager() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Activiteiten Beheer</h2>
          <p className="text-zinc-400">Beheer en plan activiteiten en evenementen</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-2xl font-bold mb-2">Binnenkort Beschikbaar</h3>
          <p className="text-zinc-400 max-w-md mx-auto">
            De activiteiten manager is momenteel in ontwikkeling. 
            Je kunt activiteiten voorlopig aanpassen in de code bij <code className="text-primary">/src/pages/Activiteiten.jsx</code>
          </p>
          <div className="mt-8">
            <p className="text-sm text-zinc-500">
              Geplande features: Activiteiten toevoegen, bewerken, verwijderen, categoriseren en plannen
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
