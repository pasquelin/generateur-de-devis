import { useEffect, useRef, useState } from 'react'

import { aiService } from '../../ai/ai.service'
import type { AIMessage } from '../../ai/ai.types'
import { Panel } from '../../components/Panel'
import type { DocumentData } from '../../types'
import { useDocumentStore } from '../preview/document.store'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'
import { VoiceChatInput } from './VoiceChatInput'
import { useChatStore } from './chat.store'
import { ChatPanelEmpty } from './ChatPanelEmpty.tsx'
import { useTemplateEditorAutoOpen } from '../../hooks/useTemplateEditorAutoOpen.ts'

export const ChatPanel = () => {
  const { messages, addMessage } = useChatStore()
  const { setData } = useDocumentStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useTemplateEditorAutoOpen()

  const handleSendMessage = async (content: string): Promise<string | undefined> => {
    // Ajouter le message utilisateur
    addMessage(content, 'user')

    // Indiquer que le traitement est en cours
    setIsProcessing(true)

    try {
      // Construire l'historique de conversation pour l'IA
      const conversationHistory: AIMessage[] = messages
        .concat([{ id: Date.now().toString(), role: 'user', content, timestamp: new Date() }])
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))

      // Appeler l'IA
      const response = await aiService.generateDocument(conversationHistory)

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
            discount: line.discount,
            subtotal: 0, // Calculé par le store
            discountAmount: 0, // Calculé par le store
            total: 0, // Calculé par le store
          })),
          total: 0, // Calculé par le store
          notes: response.data.notes || '',
          globalDiscount: response.data.globalDiscount,
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

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Panel className="h-full overflow-hidden">
      <div className="flex h-full flex-col gap-4">
        {/* Historique des messages */}
        <div className="relative grow overflow-y-auto">
          <div className="absolute mb-4 h-full w-full space-y-4">
            {messages.length === 0 ? (
              <ChatPanelEmpty />
            ) : (
              messages.map(message => <ChatMessage key={message.id} message={message} />)
            )}
            {isProcessing && (
              <div className="bg-base-200 flex items-center gap-2 rounded-lg px-4 py-3">
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
