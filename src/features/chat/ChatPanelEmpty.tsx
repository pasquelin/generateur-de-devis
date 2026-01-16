// eslint-disable-next-line no-shadow-restricted-names
import { MousePointerClick, Infinity } from 'lucide-react'

export const ChatPanelEmpty = () => {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="space-y-2 text-center sm:space-y-4 md:m-12 md:space-y-6 lg:m-10">
        {/* Intro */}
        <div className="mb-6 space-y-2">
          <h1 className="text-xl font-semibold md:text-3xl">Parlez-nous de votre besoin</h1>
          <p className="text-base-content/60 text-xs sm:text-sm">
            Écrivez ou parlez, comme dans une discussion
          </p>
        </div>

        {/* Interaction modes */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {/* Text */}
          <div className="border-base-300 bg-base-100 from-primary/5 rounded-xl border bg-linear-to-br p-2 shadow-lg sm:p-4">
            <div className="text-lg sm:text-2xl">⌨️</div>
            <h2 className="mt-0.5 text-base font-semibold sm:mt-1 sm:text-xl">Par écrit</h2>
            <p className="text-base-content/60 mt-0.5 text-xs sm:mt-1 sm:text-sm">
              Écrivez votre demande comme dans une application de messagerie.
            </p>
          </div>

          {/* Audio */}
          <div className="border-base-300 bg-base-100 from-primary/5 rounded-xl border bg-linear-to-br p-2 shadow-lg sm:p-4">
            <div className="text-lg sm:text-2xl">🎤</div>
            <h2 className="mt-0.5 text-base font-semibold sm:mt-1 sm:text-xl">Par audio</h2>
            <p className="text-base-content/60 mt-0.5 text-xs sm:mt-1 sm:text-sm">
              Cliquez sur le micro et expliquez votre besoin à voix haute.
            </p>
          </div>
        </div>

        {/* Audio modes */}
        <div className="bg-base-200/60 rounded-xl p-3 text-left sm:p-5">
          <h4 className="mb-3 flex items-center gap-2 text-base font-semibold sm:mb-4 sm:text-xl">
            🎧 Modes audio disponibles
          </h4>

          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="bg-base-100 rounded-lg p-2 sm:p-3">
              <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                <MousePointerClick className="text-primary size-4 sm:size-5" />
                <span className="text-sm font-medium sm:text-base">Manuel</span>
              </div>
              <p className="text-base-content/60 text-xs sm:text-sm">
                Cliquez sur le micro à chaque nouvelle phrase.
              </p>
            </div>

            <div className="bg-base-100 rounded-lg p-2 sm:p-3">
              <div className="mb-1 flex items-center gap-1.5 sm:gap-2">
                <Infinity className="text-primary size-4 sm:size-5" />
                <span className="text-sm font-medium sm:text-base">Continu</span>
              </div>
              <p className="text-base-content/60 text-xs sm:text-sm">
                Discutez librement sans recliquer après chaque réponse.
              </p>
            </div>
          </div>
        </div>

        {/* Security note */}
        <p className="text-base-content/40 text-[10px] sm:text-xs">
          🔒 Le micro se coupe automatiquement après quelques secondes de silence pour des raisons
          de sécurité.
        </p>
      </div>
    </div>
  )
}
