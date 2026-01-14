import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { DocumentData } from '../../types'
import { useDocumentPdf } from '../../hooks/useDocumentPdf.tsx'

interface DocumentPdfProps {
  data: DocumentData
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
  },

  // Warning
  warning: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    padding: 8,
    marginBottom: 10,
  },
  warningText: {
    fontSize: 8,
    color: '#92400e',
    fontWeight: 'bold',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  companyInfo: {
    fontSize: 9,
    marginBottom: 2,
    color: '#4b5563',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  documentNumber: {
    fontSize: 11,
    color: '#4b5563',
    marginBottom: 2,
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#111827',
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
    color: '#374151',
  },

  // Table
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 30,
  },
  tableColDescription: {
    width: '45%',
    fontSize: 9,
  },
  tableColQuantity: {
    width: '15%',
    fontSize: 9,
    textAlign: 'center',
  },
  tableColPrice: {
    width: '20%',
    fontSize: 9,
    textAlign: 'right',
  },
  tableColTotal: {
    width: '20%',
    fontSize: 9,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1f2937',
  },

  // Totals
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
    minWidth: 250,
  },
  totalLabel: {
    fontSize: 10,
    marginRight: 20,
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'right',
    color: '#111827',
  },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    minWidth: 250,
  },
  totalFinalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 20,
    color: '#1f2937',
  },
  totalFinalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'right',
    color: '#2563eb',
  },

  // Footer sections
  footerSection: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937',
    textTransform: 'uppercase',
  },
  footerText: {
    fontSize: 8,
    marginBottom: 2,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  footerGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  footerColumn: {
    flex: 1,
  },

  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    marginTop: 10,
    backgroundColor: '#f9fafb',
    border: '2px dashed #e5e7eb',
    borderRadius: 12,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 1.6,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateExample: {
    backgroundColor: '#dbeafe',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #bfdbfe',
    marginTop: 10,
  },
  emptyStateExampleLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 6,
  },
  emptyStateExampleText: {
    fontSize: 12,
    color: '#1e40af',
    fontStyle: 'italic',
  },

  // Legal notice
  legalNotice: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legalText: {
    fontSize: 7,
    color: '#6b7280',
    lineHeight: 1.3,
    marginBottom: 2,
  },
})

export const DocumentPdf = ({ data }: DocumentPdfProps) => {
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Warning for missing fields */}
        {config.missingFields.length > 0 && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ INFORMATIONS OBLIGATOIRES MANQUANTES :{' '}
              {config.missingFields.map(f => f.label).join(', ')}
            </Text>
          </View>
        )}

        {/* Header */}
        {headerSection && (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {headerSection.data.logo && (
                <Image src={headerSection.data.logo} style={styles.logo} />
              )}
              <Text style={styles.companyName}>{headerSection.data.companyName}</Text>
              {headerSection.data.legalForm && (
                <Text style={styles.companyInfo}>
                  {headerSection.data.legalForm.toUpperCase()}
                  {headerSection.data.capital && ` - Capital : ${headerSection.data.capital}`}
                </Text>
              )}
              <Text style={styles.companyInfo}>{headerSection.data.address}</Text>
              <Text style={styles.companyInfo}>
                {headerSection.data.postalCode} {headerSection.data.city}
              </Text>
              {headerSection.data.phone && (
                <Text style={styles.companyInfo}>Tél : {headerSection.data.phone}</Text>
              )}
              <Text style={styles.companyInfo}>Email : {headerSection.data.email}</Text>
              <Text style={styles.companyInfo}>SIRET : {headerSection.data.siret}</Text>
              {headerSection.data.vatNumber && (
                <Text style={styles.companyInfo}>TVA : {headerSection.data.vatNumber}</Text>
              )}
              {headerSection.data.rcs && (
                <Text style={styles.companyInfo}>{headerSection.data.rcs}</Text>
              )}
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.documentTitle}>DEVIS</Text>
              <Text style={styles.documentNumber}>N° {headerSection.data.documentNumber}</Text>
              <Text style={styles.documentNumber}>Date : {headerSection.data.emissionDate}</Text>
              <Text style={styles.documentNumber}>
                Valable jusqu'au : {headerSection.data.validityDate}
              </Text>
            </View>
          </View>
        )}

        {/* Client Section */}
        {clientSection && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client</Text>
            <Text style={styles.clientName}>{clientSection.data.name}</Text>
            <Text style={styles.text}>{clientSection.data.address}</Text>
            <Text style={styles.text}>{clientSection.data.email}</Text>
          </View>
        )}

        {/* Details Section */}
        {linesSection && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails des prestations</Text>

            {linesSection.data.length === 0 ? (
              /* Empty state */
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateEmoji}>🤖</Text>
                <Text style={styles.emptyStateTitle}>Commencez à créer votre devis !</Text>
                <Text style={styles.emptyStateDescription}>
                  Parlez avec l'assistant IA pour ajouter vos prestations au devis.
                </Text>
                <View style={styles.emptyStateExample}>
                  <Text style={styles.emptyStateExampleLabel}>💡 Exemple</Text>
                  <Text style={styles.emptyStateExampleText}>
                    "Ajoute une ligne pour une installation de ligne d'échappement inox à 2500€"
                  </Text>
                </View>
              </View>
            ) : (
              /* Table with data */
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableColDescription, styles.tableHeaderText]}>
                    Description
                  </Text>
                  <Text style={[styles.tableColQuantity, styles.tableHeaderText]}>Qté</Text>
                  <Text style={[styles.tableColPrice, styles.tableHeaderText]}>Prix unit. HT</Text>
                  <Text style={[styles.tableColTotal, styles.tableHeaderText]}>Total HT</Text>
                </View>

                {/* Table Rows */}
                {linesSection.data.map(line => (
                  <View key={line.id} style={styles.tableRow}>
                    <Text style={styles.tableColDescription}>{line.description}</Text>
                    <Text style={styles.tableColQuantity}>{line.quantity}</Text>
                    <Text style={styles.tableColPrice}>{line.unitPrice.toFixed(2)} €</Text>
                    <Text style={styles.tableColTotal}>{line.total.toFixed(2)} €</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Totals */}
        {totalsSection && (
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total HT</Text>
              <Text style={styles.totalValue}>{totalsSection.data.subtotal.toFixed(2)} €</Text>
            </View>

            {totalsSection.data.vatNotApplicable ? (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA non applicable</Text>
                <Text style={styles.totalValue}>Art. 293 B du CGI</Text>
              </View>
            ) : (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TVA ({totalsSection.data.vatRate}%)</Text>
                <Text style={styles.totalValue}>{totalsSection.data.vatAmount.toFixed(2)} €</Text>
              </View>
            )}

            <View style={styles.totalFinal}>
              <Text style={styles.totalFinalLabel}>Total TTC</Text>
              <Text style={styles.totalFinalValue}>{totalsSection.data.totalTTC.toFixed(2)} €</Text>
            </View>

            {totalsSection.data.depositRequired && totalsSection.data.depositAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Acompte à la commande ({totalsSection.data.depositPercentage}%)
                </Text>
                <Text style={styles.totalValue}>
                  {totalsSection.data.depositAmount.toFixed(2)} €
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer - Payment Conditions */}
        {paymentSection && (
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Conditions de règlement</Text>
            <View style={styles.footerGrid}>
              <View style={styles.footerColumn}>
                <Text style={styles.footerText}>
                  • Conditions : {paymentSection.data.paymentTerms}
                </Text>
                <Text style={styles.footerText}>
                  • Modes de paiement : {paymentSection.data.paymentMethods}
                </Text>
                {paymentSection.data.depositRequired && (
                  <Text style={styles.footerText}>
                    • Acompte requis : {paymentSection.data.depositPercentage}% à la commande
                  </Text>
                )}
              </View>

              {bankingSection && (
                <View style={styles.footerColumn}>
                  {bankingSection.data.bankName && (
                    <Text style={styles.footerText}>• Banque : {bankingSection.data.bankName}</Text>
                  )}
                  {bankingSection.data.iban && (
                    <Text style={styles.footerText}>• IBAN : {bankingSection.data.iban}</Text>
                  )}
                  {bankingSection.data.bic && (
                    <Text style={styles.footerText}>• BIC : {bankingSection.data.bic}</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer - Insurance */}
        {insuranceSection && (
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Assurance décennale</Text>
            {insuranceSection.data.insurerName && (
              <Text style={styles.footerText}>
                • Assureur : {insuranceSection.data.insurerName}
              </Text>
            )}
            {insuranceSection.data.policyNumber && (
              <Text style={styles.footerText}>
                • N° de police : {insuranceSection.data.policyNumber}
              </Text>
            )}
            {insuranceSection.data.coverageZone && (
              <Text style={styles.footerText}>
                • Zone de couverture : {insuranceSection.data.coverageZone}
              </Text>
            )}
          </View>
        )}

        {/* Custom Footer Text */}
        {customSection && (
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Informations complémentaires</Text>
            <Text style={styles.footerText}>{customSection.data.text}</Text>
          </View>
        )}

        {/* Legal Notice */}
        {legalSection && (
          <View style={styles.legalNotice}>
            <Text style={styles.legalText}>
              • En cas de retard de paiement : {legalSection.data.latePenaltyRate}
            </Text>
            <Text style={styles.legalText}>
              • Indemnité forfaitaire de recouvrement : {legalSection.data.recoveryFee} € (art.
              L441-6 et D441-5 du Code de commerce)
            </Text>
            <Text style={styles.legalText}>
              • Devis valable {legalSection.data.quoteValidityDays} jours à compter de la date
              d'émission
            </Text>
            <Text style={styles.legalText}>
              • Acceptation du devis : signature précédée de la mention "Bon pour accord"
            </Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
