import { useEffect, useRef, useState } from 'react'

import { aiService } from '../../ai/ai.service'
import type { AIMessage } from '../../ai/ai.types'
import { Panel } from '../../components/Panel'
import type { DocumentData } from '../../types'
import { useDocumentStore } from '../preview/document.store'
import { useSettingsStore } from '../settings/settings.store'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'
import { VoiceChatInput } from './VoiceChatInput'
import { useChatStore } from './chat.store'

export const ChatPanel = () => {
  const { messages, addMessage } = useChatStore()
  const { setData } = useDocumentStore()
  const { settings } = useSettingsStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Configurer la clé API
  useEffect(() => {
    if (settings.api.openaiKey) {
      aiService.setApiKey(settings.api.openaiKey)
    }
  }, [settings.api.openaiKey])

  const handleSendMessage = async (content: string): Promise<string | undefined> => {
    // Ajouter le message utilisateur
    addMessage(content, 'user')

    // Vérifier la clé API
    if (!settings.api.openaiKey) {
      const errorMsg = '⚠️ Veuillez configurer votre clé API OpenAI dans les paramètres.'
      addMessage(errorMsg, 'assistant')
      return errorMsg
    }

    // Indiquer que le traitement est en cours
    setIsProcessing(true)

    try {
      // Construire l'historique de conversation pour l'IA
      const conversationHistory: AIMessage[] = messages
        .concat([{ id: Date.now().toString(), role: 'user', content, timestamp: new Date() }])
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      // Appeler l'IA
      const response = await aiService.generateDocument(
        conversationHistory,
        undefined,
        settings.products.items,
      )

      if (response.success && response.data) {
        // Convertir les données IA en format DocumentData
        const documentData: DocumentData = {
          title: response.data.title,
          client: response.data.client,
          lines: response.data.lines.map((line, index) => ({
            id: `line-${Date.now()}-${index}`,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            total: line.quantity * line.unitPrice,
          })),
          total: response.data.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
          notes: response.data.notes || '',
        }

        // Mettre à jour le document
        setData(documentData)

        // Ajouter un message de confirmation
        // Utiliser responseAudio si disponible, sinon message par défaut
        const confirmationMessage =
          response.data.responseAudio ||
          `✅ Devis mis à jour avec succès !\n\n📄 ${response.data.lines.length} ligne(s) ajoutée(s)\n💰 Total: ${documentData.total.toFixed(2)} €`

        addMessage(confirmationMessage, 'assistant')
        return confirmationMessage
      } else {
        // Erreur IA
        const errorMsg = `❌ Erreur: ${response.error || 'Impossible de générer le devis'}`
        addMessage(errorMsg, 'assistant')
        return errorMsg
      }
    } catch (error) {
      console.error("Erreur lors de l'appel IA:", error)
      const errorMsg = "❌ Une erreur inattendue s'est produite. Veuillez réessayer."
      addMessage(errorMsg, 'assistant')
      return errorMsg
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Panel className="overflow-hidden h-full">
      <div className="flex flex-col h-full gap-4">
        {/* Historique des messages */}
        <div className="grow relative overflow-y-auto">
          <div className="absolute mb-4 space-y-4 w-full">
            {messages.length === 0 ? (
              <div className="m-20 text-center space-y-6">
                {/* Intro */}
                <p className="text-xl font-semibold text-base-content/70">
                  Expliquez simplement votre besoin dans la conversation
                </p>

                {/* Interaction modes */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Text */}
                  <div className="rounded-xl border border-base-300 p-4 bg-base-100">
                    <div className="text-lg">⌨️</div>
                    <h3 className="font-semibold mt-1">Par écrit</h3>
                    <p className="text-sm text-base-content/60 mt-1">
                      Écrivez votre demande comme dans une application de messagerie.
                    </p>
                  </div>

                  {/* Audio */}
                  <div className="rounded-xl border border-base-300 p-4 bg-base-100">
                    <div className="text-lg">🎤</div>
                    <h3 className="font-semibold mt-1">Par audio</h3>
                    <p className="text-sm text-base-content/60 mt-1">
                      Cliquez sur le micro et expliquez votre besoin à voix haute.
                    </p>
                  </div>
                </div>

                {/* Audio modes */}
                <div className="rounded-xl bg-base-200/60 p-5 text-left">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    🎧 Modes audio disponibles
                  </h4>

                  <ul className="space-y-2 text-sm text-base-content/70">
                    <li className="flex gap-2">
                      <span className="font-medium">• Mode manuel :</span>
                      <span>cliquez sur le micro à chaque nouvelle phrase.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-medium">• Mode continu :</span>
                      <span>discutez librement sans recliquer après chaque réponse.</span>
                    </li>
                  </ul>
                </div>

                {/* Security note */}
                <p className="text-xs text-base-content/40">
                  🔒 Le micro se coupe automatiquement après quelques secondes de silence pour des
                  raisons de sécurité.
                </p>
              </div>
            ) : (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            )}
            {isProcessing && (
              <div className="flex items-center gap-2 px-4 py-3 bg-base-200 rounded-lg">
                <div className="loading loading-spinner loading-sm" />
                <span className="text-sm">L'IA analyse votre demande...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Input selon le mode */}
        <VoiceChatInput onSendMessage={handleSendMessage} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </Panel>
  )
}
