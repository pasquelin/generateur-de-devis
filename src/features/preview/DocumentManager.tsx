import { useState, type KeyboardEvent, type ChangeEvent } from 'react'
import { type SavedDocument, useDocumentStore } from './document.store.ts'
import {
  FileBracesCorner,
  FileDown,
  FileJson,
  FileText,
  Info,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react'

export const DocumentManager = () => {
  const {
    save,
    load,
    getSavedDocuments,
    deleteSavedDocument,
    updateSavedDocument,
    searchDocuments,
    filterDocuments,
    exportToJSON,
    exportAllToJSON,
    importFromJSON,
    hasChange,
  } = useDocumentStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: undefined as number | undefined,
    maxAmount: undefined as number | undefined,
  })
  const [searchResults, setSearchResults] = useState<SavedDocument[]>([])
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  const [showSavedDocsModal, setShowSavedDocsModal] = useState(false)

  // Recherche simple
  const handleSearch = () => {
    const results = searchDocuments(searchTerm)
    setSearchResults(results)
    setShowResultsModal(true)
  }

  // Recherche avec Enter
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Filtre avancé
  const handleFilter = () => {
    const results = filterDocuments({
      searchTerm,
      ...filter,
    })
    setSearchResults(results)
    setShowFiltersModal(false)
    setShowResultsModal(true)
  }

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilter({
      dateFrom: '',
      dateTo: '',
      minAmount: undefined,
      maxAmount: undefined,
    })
  }

  // Sauvegarde
  const handleSave = () => {
    const title = prompt('Titre de la sauvegarde :')
    if (title) {
      save(title)
    }
  }

  // Mise à jour
  const handleUpdate = (id: string) => {
    const success = updateSavedDocument(id)
    if (success) {
      alert('Sauvegarde mise à jour')
    }
  }

  // Import
  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const content = e.target?.result as string
        const success = importFromJSON(content)
        if (success) {
          alert('Import réussi')
        }
      }
      reader.readAsText(file)
    }
  }

  const savedDocs = getSavedDocuments()

  return (
    <div className="rounded-box bg-base-200 mx-auto w-full max-w-4xl p-4">
      {/* Barre de recherche principale */}
      <div className="join mb-2 w-full">
        <input
          type="search"
          placeholder="Rechercher un document..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="input input-bordered input-sm join-item w-full"
          aria-label="Champ de recherche de documents"
        />

        <div className="tooltip tooltip-bottom" data-tip="Rechercher">
          <button
            className="btn btn-primary btn-sm join-item"
            onClick={handleSearch}
            aria-label="Lancer la recherche"
          >
            <Search />
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Filtres avancés">
          <button
            className="btn btn-primary btn-sm join-item ml-0.5"
            onClick={() => setShowFiltersModal(true)}
            aria-label="Ouvrir les filtres avancés"
          >
            <SlidersHorizontal />
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex flex-wrap justify-between gap-2">
        <button
          className="btn btn-xs"
          onClick={() => setShowSavedDocsModal(true)}
          aria-label="Voir toutes les sauvegardes"
        >
          <FileText size={14} />
          <span className="ml-1">Mes devis enregistrés ({savedDocs.length})</span>
        </button>

        <button
          className="btn btn-xs btn-success"
          onClick={handleSave}
          aria-label="Créer une nouvelle sauvegarde"
          disabled={!hasChange()}
        >
          <Save size={16} /> Enregistrer
        </button>
      </div>

      {/* Modal: Filtres avancés */}
      <dialog className={`modal ${showFiltersModal ? 'modal-open' : ''}`}>
        <div className="modal-box" role="dialog" aria-labelledby="filters-title">
          <h3 id="filters-title" className="mb-4 text-lg font-bold">
            Filtres avancés
          </h3>

          <div className="form-control mb-3 w-full">
            <label className="label">
              <span className="label-text">Recherche textuelle</span>
            </label>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input input-bordered w-full"
              aria-label="Recherche textuelle dans les filtres"
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date début</span>
              </label>
              <input
                type="date"
                value={filter.dateFrom}
                className="input input-bordered"
                onChange={e => setFilter({ ...filter, dateFrom: e.target.value })}
                aria-label="Date de début pour le filtre"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Date fin</span>
              </label>
              <input
                type="date"
                value={filter.dateTo}
                className="input input-bordered"
                onChange={e => setFilter({ ...filter, dateTo: e.target.value })}
                aria-label="Date de fin pour le filtre"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Montant min (€)</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className="input input-bordered"
                onChange={e =>
                  setFilter({ ...filter, minAmount: Number(e.target.value) || undefined })
                }
                aria-label="Montant minimum pour le filtre"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Montant max (€)</span>
              </label>
              <input
                type="number"
                placeholder="∞"
                className="input input-bordered"
                onChange={e =>
                  setFilter({ ...filter, maxAmount: Number(e.target.value) || undefined })
                }
                aria-label="Montant maximum pour le filtre"
              />
            </div>
          </div>

          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={handleResetFilters}
              aria-label="Réinitialiser tous les filtres"
            >
              Réinitialiser
            </button>
            <button
              className="btn btn-error"
              onClick={() => setShowFiltersModal(false)}
              aria-label="Annuler et fermer les filtres"
            >
              Annuler
            </button>
            <button
              className="btn btn-primary"
              onClick={handleFilter}
              aria-label="Appliquer les filtres"
            >
              Appliquer
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button
            onClick={() => setShowFiltersModal(false)}
            aria-label="Fermer la modal des filtres"
          >
            Fermer
          </button>
        </form>
      </dialog>

      {/* Modal: Résultats de recherche */}
      <dialog className={`modal ${showResultsModal ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-3xl" role="dialog" aria-labelledby="results-title">
          <h3 id="results-title" className="mb-4 text-lg font-bold">
            Résultats de recherche ({searchResults.length})
          </h3>

          {searchResults.length === 0 ? (
            <div className="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>Aucun document trouvé</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-zebra table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>N° Document</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(doc => (
                    <tr key={doc.id}>
                      <td className="font-semibold">{doc.title}</td>
                      <td>{doc.documentNumber}</td>
                      <td>{doc.data.client.name}</td>
                      <td>{doc.data.total.toFixed(2)} €</td>
                      <td className="text-sm">{new Date(doc.savedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-1">
                          <div className="tooltip" data-tip="Charger">
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={() => {
                                load(doc.id)
                                setShowResultsModal(false)
                              }}
                              aria-label={`Charger le document ${doc.title}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={() => setShowResultsModal(false)}
              aria-label="Fermer les résultats de recherche"
            >
              Fermer
            </button>
          </div>
        </div>
        <button
          className="modal-backdrop"
          onClick={() => setShowResultsModal(false)}
          aria-label="Fermer la modal des résultats"
        />
      </dialog>

      {/* Modal: Liste des sauvegardes */}
      <dialog className={`modal ${showSavedDocsModal ? 'modal-open' : ''}`}>
        <div
          className="modal-box max-w-4xl space-y-6"
          role="dialog"
          aria-labelledby="saved-docs-title"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 id="saved-docs-title" className="text-lg font-bold">
              Mes devis enregistrés ({savedDocs.length})
            </h3>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-warning"
                onClick={() => exportAllToJSON()}
                aria-label="Exporter tout en JSON"
              >
                <FileBracesCorner size={16} />
                Exporter tout (JSON)
              </button>

              <label
                htmlFor="import-file"
                className="btn btn-sm btn-warning"
                aria-label="Importer depuis un fichier JSON"
              >
                <FileDown size={16} />
                Importer (JSON)
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  aria-label="Sélectionner un fichier JSON à importer"
                />
              </label>
            </div>
          </div>

          {savedDocs.length === 0 ? (
            <div className="alert alert-info alert-soft">
              <Info />
              <span>Aucun devis enregistré pour le moment</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-zebra table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>N° Document</th>
                    <th>Client</th>
                    <th>Total</th>
                    <th>Modifié le</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {savedDocs.map(doc => (
                    <tr key={doc.id}>
                      <td className="font-semibold">{doc.title}</td>
                      <td>{doc.documentNumber}</td>
                      <td>{doc.data.client.name}</td>
                      <td>{doc.data.total.toFixed(2)} €</td>
                      <td className="text-sm">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                      <td className="flex justify-end gap-1">
                        <div className="tooltip" data-tip="Charger">
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => {
                              load(doc.id)
                              setShowSavedDocsModal(false)
                            }}
                            aria-label={`Charger le document ${doc.title}`}
                          >
                            <Upload className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="tooltip" data-tip="Mettre à jour">
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => handleUpdate(doc.id)}
                            aria-label={`Mettre à jour ${doc.title}`}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="tooltip" data-tip="Exporter JSON">
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => exportToJSON(doc.id)}
                            aria-label={`Exporter ${doc.title} en JSON`}
                          >
                            <FileJson className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="tooltip tooltip-error" data-tip="Supprimer">
                          <button
                            className="btn btn-xs btn-ghost text-error hover:bg-error hover:text-error-content"
                            onClick={() => deleteSavedDocument(doc.id)}
                            aria-label={`Supprimer ${doc.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="modal-action">
            <button
              className="btn btn-error"
              onClick={() => setShowSavedDocsModal(false)}
              aria-label="Fermer la liste des sauvegardes"
            >
              Fermer
            </button>
          </div>
        </div>
        <button
          className="modal-backdrop"
          onClick={() => setShowSavedDocsModal(false)}
          aria-label="Fermer la modal des sauvegardes"
        />
      </dialog>
    </div>
  )
}
