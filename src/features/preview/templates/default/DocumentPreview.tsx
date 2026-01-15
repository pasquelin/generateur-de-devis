import type { DocumentData } from '../../../../types'
import { useDocumentPdf } from '../../../../hooks/useDocumentPdf.tsx'
import { useDocumentStore } from '../../document.store'
import { EditableField } from '../../EditableField'
import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useSettingsStore } from '../../../settings/settings.store'

interface DocumentPreviewProps {
  data: DocumentData
}

export const DocumentPreview = ({ data }: DocumentPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const { settings } = useSettingsStore()
  const { activeTemplate, templates } = settings.template
  const styles = templates[activeTemplate]?.styles

  // Palette de couleurs dérivée du template pour une hiérarchie visuelle cohérente
  const colors = {
    primary: styles?.primaryColor || '#2563eb',
    text: styles?.textColor || '#111827',
    textLight: '#374151',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
    background: styles?.backgroundColor || '#f9fafb',
    backgroundAlt: '#f3f4f6',
    accent: styles?.accentColor || '#f59e0b',
    accentLight: '#fef3c7',
    accentDark: '#92400e',
    border: styles?.borderColor || '#e5e7eb',
    borderDashed: '#d1d5db',
    white: '#ffffff',
    infoBackground: '#dbeafe',
    infoBorder: '#bfdbfe',
    infoText: '#1e40af',
  }

  const { updateClient, updateLine, deleteLine } = useDocumentStore()
  const {
    headerSection,
    clientSection,
    linesSection,
    totalsSection,
    paymentSection,
    bankingSection,
    insuranceSection,
    customSection,
    legalSection,
    config,
  } = useDocumentPdf(data)

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const containerHeight = containerRef.current.offsetHeight
        const contentWidth = contentRef.current.offsetWidth
        const contentHeight = contentRef.current.offsetHeight

        const scaleX = (containerWidth - 40) / contentWidth
        const scaleY = (containerHeight - 40) / contentHeight

        const newScale = Math.min(1, scaleX, scaleY)
        setScale(newScale)
      }
    }

    const timer = setTimeout(updateScale, 100)

    const resizeObserver = new ResizeObserver(updateScale)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div
          ref={contentRef}
          id="document-preview"
          style={{
            backgroundColor: colors.white,
            padding: `${styles?.basePadding || 40}px`,
            color: colors.text,
            width: '210mm',
            minHeight: '297mm',
            fontFamily: styles?.font || 'Helvetica, Arial, sans-serif',
            fontSize: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: 6,
          }}
        >
          {/* Warning for missing fields */}
          {config.missingFields.length > 0 && (
            <div
              style={{
                backgroundColor: colors.accentLight,
                borderLeft: `3px solid ${colors.accent}`,
                padding: '8px',
                marginBottom: '10px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '8px',
                  color: colors.accent,
                  fontWeight: 'bold',
                  backgroundColor: colors.accentLight,
                }}
              >
                ⚠️ INFORMATIONS OBLIGATOIRES MANQUANTES :{' '}
                {config.missingFields.map(f => f.label).join(', ')}
              </p>
            </div>
          )}

          {/* Header */}
          {headerSection && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: `2px solid ${colors.primary}`,
              }}
            >
              <div style={{ flex: 1 }}>
                {headerSection.data.logo && (
                  <img
                    src={headerSection.data.logo}
                    alt="Logo"
                    style={{
                      width: `${styles?.logoWidth || 80}px`,
                      height: `${styles?.logoWidth || 80}px`,
                      marginBottom: '10px',
                      objectFit: 'contain',
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                    color: colors.text,
                  }}
                >
                  {headerSection.data.companyName}
                </div>
                {headerSection.data.legalForm && (
                  <div
                    style={{ fontSize: '9px', marginBottom: '2px', color: colors.textSecondary }}
                  >
                    {headerSection.data.legalForm.toUpperCase()}
                    {headerSection.data.capital && ` - Capital : ${headerSection.data.capital}`}
                  </div>
                )}
                <div style={{ fontSize: '9px', marginBottom: '2px', color: colors.textSecondary }}>
                  {headerSection.data.address}
                </div>
                <div style={{ fontSize: '9px', marginBottom: '2px', color: colors.textSecondary }}>
                  {headerSection.data.postalCode} {headerSection.data.city}
                </div>
                {headerSection.data.phone && (
                  <div
                    style={{ fontSize: '9px', marginBottom: '2px', color: colors.textSecondary }}
                  >
                    Tél : {headerSection.data.phone}
                  </div>
                )}
                <div style={{ fontSize: '9px', marginBottom: '2px', color: colors.textSecondary }}>
                  Email : {headerSection.data.email}
                </div>
                <div style={{ fontSize: '9px', marginBottom: '2px', color: colors.textSecondary }}>
                  SIRET : {headerSection.data.siret}
                </div>
                {headerSection.data.vatNumber && (
                  <div
                    style={{ fontSize: '9px', marginBottom: '2px', color: colors.textSecondary }}
                  >
                    TVA : {headerSection.data.vatNumber}
                  </div>
                )}
                {headerSection.data.rcs && (
                  <div
                    style={{ fontSize: '9px', marginBottom: '2px', color: colors.textSecondary }}
                  >
                    {headerSection.data.rcs}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: colors.primary,
                    marginBottom: '4px',
                  }}
                >
                  DEVIS
                </div>
                <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '2px' }}>
                  N° {headerSection.data.documentNumber}
                </div>
                <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '2px' }}>
                  Date : {headerSection.data.emissionDate}
                </div>
                <div style={{ fontSize: '11px', color: colors.textSecondary, marginBottom: '2px' }}>
                  Valable jusqu'au : {headerSection.data.validityDate}
                </div>
              </div>
            </div>
          )}

          {/* Client Section */}
          {clientSection && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: colors.text,
                  textTransform: 'uppercase',
                }}
              >
                Client
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginBottom: '3px',
                  color: colors.text,
                }}
              >
                <EditableField
                  value={clientSection.data.name}
                  onChange={value => updateClient('name', String(value))}
                  style={{ fontSize: '11px', fontWeight: 'bold', color: colors.text }}
                  placeholder="Nom du client"
                />
              </div>
              <div style={{ fontSize: '10px', marginBottom: '2px', color: colors.textLight }}>
                <EditableField
                  value={clientSection.data.address}
                  onChange={value => updateClient('address', String(value))}
                  style={{ fontSize: '10px', color: colors.textLight }}
                  placeholder="Adresse du client"
                />
              </div>
              <div style={{ fontSize: '10px', marginBottom: '2px', color: colors.textLight }}>
                <EditableField
                  value={clientSection.data.email}
                  onChange={value => updateClient('email', String(value))}
                  style={{ fontSize: '10px', color: colors.textLight }}
                  placeholder="Email du client"
                />
              </div>
            </div>
          )}

          {/* Details Section */}
          {linesSection && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: colors.text,
                  textTransform: 'uppercase',
                }}
              >
                Détails des prestations
              </div>

              {linesSection.data.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 40px',
                    marginTop: '10px',
                    backgroundColor: colors.background,
                    border: `2px dashed ${colors.borderDashed}`,
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: colors.text,
                      marginBottom: '12px',
                    }}
                  >
                    Commencez à créer votre devis !
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: colors.textTertiary,
                      lineHeight: '1.6',
                      maxWidth: '400px',
                      marginBottom: '16px',
                    }}
                  >
                    Parlez avec l'assistant IA pour ajouter vos prestations au devis.
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.infoBackground,
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${colors.infoBorder}`,
                      maxWidth: '450px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: colors.infoText,
                        marginBottom: '6px',
                      }}
                    >
                      💡 Exemple
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: colors.infoText,
                        fontStyle: 'italic',
                      }}
                    >
                      "Ajoute une ligne pour une installation de ligne d'échappement inox à 2500€"
                    </div>
                  </div>
                </div>
              ) : (
                <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: colors.backgroundAlt,
                        borderBottom: `2px solid ${colors.primary}`,
                      }}
                    >
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: colors.text,
                          width: '45%',
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          textAlign: 'center',
                          padding: '8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: colors.text,
                          width: '15%',
                        }}
                      >
                        Qté
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: colors.text,
                          width: '20%',
                        }}
                      >
                        Prix unit. HT
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '8px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          color: colors.text,
                          width: '20%',
                        }}
                      >
                        Total HT
                      </th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {linesSection.data.map(line => (
                      <tr key={line.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ padding: '8px', fontSize: '9px', color: colors.text }}>
                          <EditableField
                            value={line.description}
                            onChange={value => updateLine(line.id, 'description', value)}
                            style={{ fontSize: '9px', color: colors.text }}
                            placeholder="Description"
                          />
                        </td>
                        <td
                          style={{
                            textAlign: 'center',
                            padding: '8px',
                            fontSize: '9px',
                            color: colors.text,
                          }}
                        >
                          <EditableField
                            value={line.quantity}
                            onChange={value => updateLine(line.id, 'quantity', value)}
                            style={{ fontSize: '9px', color: colors.text, textAlign: 'center' }}
                            type="number"
                            placeholder="Qté"
                          />
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            padding: '8px',
                            fontSize: '9px',
                            color: colors.text,
                          }}
                        >
                          <EditableField
                            value={line.unitPrice.toFixed(2)}
                            onChange={value => updateLine(line.id, 'unitPrice', value)}
                            style={{ fontSize: '9px', color: colors.text, textAlign: 'right' }}
                            type="number"
                            placeholder="Prix"
                          />{' '}
                          €
                        </td>
                        <td
                          style={{
                            textAlign: 'right',
                            padding: '8px',
                            fontSize: '9px',
                            fontWeight: 'bold',
                            color: colors.text,
                          }}
                        >
                          {line.total.toFixed(2)} €
                        </td>
                        <td>
                          <button
                            className="btn btn-xs btn-square btn-error btn-link"
                            onClick={() => deleteLine(line.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Totals */}
          {totalsSection && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: '250px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '5px',
                  }}
                >
                  <span style={{ fontSize: '10px', color: colors.textSecondary }}>Total HT</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.text }}>
                    {totalsSection.data.subtotal.toFixed(2)} €
                  </span>
                </div>

                {totalsSection.data.vatNotApplicable ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '5px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: colors.textSecondary }}>
                      TVA non applicable
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.text }}>
                      Art. 293 B du CGI
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '5px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: colors.textSecondary }}>
                      TVA ({totalsSection.data.vatRate}%)
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.text }}>
                      {totalsSection.data.vatAmount.toFixed(2)} €
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: `2px solid ${colors.primary}`,
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: colors.text }}>
                    Total TTC
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: colors.primary }}>
                    {totalsSection.data.totalTTC.toFixed(2)} €
                  </span>
                </div>

                {totalsSection.data.depositRequired && totalsSection.data.depositAmount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '5px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: colors.textSecondary }}>
                      Acompte à la commande ({totalsSection.data.depositPercentage}%)
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: colors.text }}>
                      {totalsSection.data.depositAmount.toFixed(2)} €
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer - Payment Conditions */}
          {paymentSection && (
            <div
              style={{
                marginTop: '15px',
                paddingTop: '10px',
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  color: colors.text,
                  textTransform: 'uppercase',
                }}
              >
                Conditions de règlement
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '8px',
                      marginBottom: '2px',
                      color: colors.textSecondary,
                      lineHeight: '1.4',
                    }}
                  >
                    • Conditions : {paymentSection.data.paymentTerms}
                  </div>
                  <div
                    style={{
                      fontSize: '8px',
                      marginBottom: '2px',
                      color: colors.textSecondary,
                      lineHeight: '1.4',
                    }}
                  >
                    • Modes de paiement : {paymentSection.data.paymentMethods}
                  </div>
                  {paymentSection.data.depositRequired && (
                    <div
                      style={{
                        fontSize: '8px',
                        marginBottom: '2px',
                        color: colors.textSecondary,
                        lineHeight: '1.4',
                      }}
                    >
                      • Acompte requis : {paymentSection.data.depositPercentage}% à la commande
                    </div>
                  )}
                </div>

                {bankingSection && (
                  <div style={{ flex: 1 }}>
                    {bankingSection.data.bankName && (
                      <div
                        style={{
                          fontSize: '8px',
                          marginBottom: '2px',
                          color: colors.textSecondary,
                          lineHeight: '1.4',
                        }}
                      >
                        • Banque : {bankingSection.data.bankName}
                      </div>
                    )}
                    {bankingSection.data.iban && (
                      <div
                        style={{
                          fontSize: '8px',
                          marginBottom: '2px',
                          color: colors.textSecondary,
                          lineHeight: '1.4',
                        }}
                      >
                        • IBAN : {bankingSection.data.iban}
                      </div>
                    )}
                    {bankingSection.data.bic && (
                      <div
                        style={{
                          fontSize: '8px',
                          marginBottom: '2px',
                          color: colors.textSecondary,
                          lineHeight: '1.4',
                        }}
                      >
                        • BIC : {bankingSection.data.bic}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer - Insurance */}
          {insuranceSection && (
            <div
              style={{
                marginTop: '15px',
                paddingTop: '10px',
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  color: colors.text,
                  textTransform: 'uppercase',
                }}
              >
                Assurance décennale
              </div>
              {insuranceSection.data.insurerName && (
                <div
                  style={{
                    fontSize: '8px',
                    marginBottom: '2px',
                    color: colors.textSecondary,
                    lineHeight: '1.4',
                  }}
                >
                  • Assureur : {insuranceSection.data.insurerName}
                </div>
              )}
              {insuranceSection.data.policyNumber && (
                <div
                  style={{
                    fontSize: '8px',
                    marginBottom: '2px',
                    color: colors.textSecondary,
                    lineHeight: '1.4',
                  }}
                >
                  • N° de police : {insuranceSection.data.policyNumber}
                </div>
              )}
              {insuranceSection.data.coverageZone && (
                <div
                  style={{
                    fontSize: '8px',
                    marginBottom: '2px',
                    color: colors.textSecondary,
                    lineHeight: '1.4',
                  }}
                >
                  • Zone de couverture : {insuranceSection.data.coverageZone}
                </div>
              )}
            </div>
          )}

          {/* Custom Footer Text */}
          {customSection && (
            <div
              style={{
                marginTop: '15px',
                paddingTop: '10px',
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  color: colors.text,
                  textTransform: 'uppercase',
                }}
              >
                Informations complémentaires
              </div>
              <div style={{ fontSize: '8px', color: colors.textSecondary, lineHeight: '1.4' }}>
                {customSection.data.text}
              </div>
            </div>
          )}

          {/* Legal Notice */}
          {legalSection && (
            <div
              style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: '7px',
                  color: colors.textTertiary,
                  lineHeight: '1.3',
                  marginBottom: '2px',
                }}
              >
                • En cas de retard de paiement : {legalSection.data.latePenaltyRate}
              </div>
              <div
                style={{
                  fontSize: '7px',
                  color: colors.textTertiary,
                  lineHeight: '1.3',
                  marginBottom: '2px',
                }}
              >
                • Indemnité forfaitaire de recouvrement : {legalSection.data.recoveryFee} € (art.
                L441-6 et D441-5 du Code de commerce)
              </div>
              <div
                style={{
                  fontSize: '7px',
                  color: colors.textTertiary,
                  lineHeight: '1.3',
                  marginBottom: '2px',
                }}
              >
                • Devis valable {legalSection.data.quoteValidityDays} jours à compter de la date
                d'émission
              </div>
              <div
                style={{
                  fontSize: '7px',
                  color: colors.textTertiary,
                  lineHeight: '1.3',
                  marginBottom: '2px',
                }}
              >
                • Acceptation du devis : signature précédée de la mention "Bon pour accord"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
