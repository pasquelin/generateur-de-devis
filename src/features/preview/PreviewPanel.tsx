import { Panel } from '../../components/Panel'
import { DocumentPreview } from './DocumentPreview'
import { useDocumentStore } from './document.store'

export const PreviewPanel = () => {
  const { data } = useDocumentStore()

  return (
    <Panel className="relative">
      <div className="absolute inset-0">
        <DocumentPreview data={data} />
      </div>
    </Panel>
  )
}