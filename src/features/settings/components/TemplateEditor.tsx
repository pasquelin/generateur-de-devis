import { Panel } from '../../../components/Panel'
import { useSettingsStore } from '../settings.store'

const FONTS = [
  'Helvetica',
  'Helvetica-Bold',
  'Times-Roman',
  'Times-Bold',
  'Courier',
  'Courier-Bold',
]

export const TemplateEditor = () => {
  const { settings, updateTemplate } = useSettingsStore()
  const { activeTemplate, templates } = settings.template
  const currentTemplate = templates[activeTemplate]

  if (!currentTemplate) {
    return null
  }

  const { styles } = currentTemplate

  const handleTemplateChange = (templateId: string) => {
    updateTemplate({
      activeTemplate: templateId,
    })
  }

  const handleStyleChange = (key: keyof typeof styles, value: string | number) => {
    updateTemplate({
      templates: {
        ...templates,
        [activeTemplate]: {
          ...currentTemplate,
          styles: {
            ...styles,
            [key]: value,
          },
        },
      },
    })
  }

  return (
    <Panel className="h-full overflow-y-auto">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white">Éditeur de template</h2>
        <p className="text-sm text-gray-400">Modifiez les paramètres</p>

        <div className="divider" />

        {/* Choix du template */}
        <div className="form-control">
          <label className="label">
            <span className="label-text text-xs font-semibold">Template actif</span>
          </label>
          <select
            value={activeTemplate}
            onChange={e => handleTemplateChange(e.target.value)}
            className="select select-bordered select-sm text-xs"
          >
            {Object.entries(templates).map(([id, template]) => (
              <option key={id} value={id}>
                {template.name}
                {template.description && ` - ${template.description}`}
              </option>
            ))}
          </select>
        </div>

        <div className="divider" />

        {/* Couleurs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Couleurs</h3>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Couleur primaire</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={styles.primaryColor}
                onChange={e => handleStyleChange('primaryColor', e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border-2 border-gray-600"
              />
              <input
                type="text"
                value={styles.primaryColor}
                onChange={e => handleStyleChange('primaryColor', e.target.value)}
                className="input input-bordered input-sm flex-1 text-xs"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Couleur de texte</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={styles.textColor}
                onChange={e => handleStyleChange('textColor', e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border-2 border-gray-600"
              />
              <input
                type="text"
                value={styles.textColor}
                onChange={e => handleStyleChange('textColor', e.target.value)}
                className="input input-bordered input-sm flex-1 text-xs"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Couleur d'arrière-plan</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={styles.backgroundColor}
                onChange={e => handleStyleChange('backgroundColor', e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border-2 border-gray-600"
              />
              <input
                type="text"
                value={styles.backgroundColor}
                onChange={e => handleStyleChange('backgroundColor', e.target.value)}
                className="input input-bordered input-sm flex-1 text-xs"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Couleur d'accent</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={styles.accentColor}
                onChange={e => handleStyleChange('accentColor', e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border-2 border-gray-600"
              />
              <input
                type="text"
                value={styles.accentColor}
                onChange={e => handleStyleChange('accentColor', e.target.value)}
                className="input input-bordered input-sm flex-1 text-xs"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Couleur des bordures</span>
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={styles.borderColor}
                onChange={e => handleStyleChange('borderColor', e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border-2 border-gray-600"
              />
              <input
                type="text"
                value={styles.borderColor}
                onChange={e => handleStyleChange('borderColor', e.target.value)}
                className="input input-bordered input-sm flex-1 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Typographie */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Typographie</h3>

          <div className="form-control">
            <select
              value={styles.font}
              onChange={e => handleStyleChange('font', e.target.value)}
              className="select select-bordered select-sm text-xs"
            >
              {FONTS.map(font => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divider" />

        {/* Dimensions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Dimensions</h3>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Largeur du logo</span>
            </label>
            <input
              type="range"
              min="40"
              max="150"
              value={styles.logoWidth}
              onChange={e => handleStyleChange('logoWidth', Number(e.target.value))}
              className="range range-primary range-xs"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>40px</span>
              <span className="font-semibold text-white">{styles.logoWidth}px</span>
              <span>150px</span>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-xs">Marges intérieures</span>
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={styles.basePadding}
              onChange={e => handleStyleChange('basePadding', Number(e.target.value))}
              className="range range-primary range-xs"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>20px</span>
              <span className="font-semibold text-white">{styles.basePadding}px</span>
              <span>80px</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
