import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { useMemo } from 'react'

import type { DocumentData } from '../../../../types'
import { useDocumentPdf } from '../../../../hooks/useDocumentPdf.tsx'
import { useSettingsStore } from '../../../settings/settings.store'

interface DocumentPdfProps {
  data: DocumentData
}

export const DocumentPdf = ({ data }: DocumentPdfProps) => {
  const { settings } = useSettingsStore()
  const { activeTemplate, templates } = settings.template
  const styles = templates[activeTemplate]?.styles

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

  // Palette de couleurs dérivée du template pour une hiérarchie visuelle cohérente
  const colors = useMemo(
    () => ({
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
      white: '#ffffff',
    }),
    [styles],
  )

  // Create dynamic styles based on template settings
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        page: {
          backgroundColor: colors.white,
          padding: styles?.basePadding || 40,
          fontFamily: styles?.font || 'Helvetica',
          fontSize: 10,
          color: colors.text,
        },

        // Warning
        warning: {
          backgroundColor: colors.accentLight,
          borderLeftWidth: 3,
          borderLeftColor: colors.accent,
          padding: 8,
          marginBottom: 10,
        },
        warningText: {
          fontSize: 8,
          color: colors.accentDark,
          fontWeight: 'bold',
        },

        // Header
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 30,
          paddingBottom: 20,
          borderBottomWidth: 2,
          borderBottomColor: colors.primary,
        },
        headerLeft: {
          flex: 1,
        },
        headerRight: {
          alignItems: 'flex-end',
        },
        logo: {
          width: styles?.logoWidth || 80,
          height: styles?.logoWidth || 80,
          marginBottom: 10,
          objectFit: 'contain',
        },
        companyName: {
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 4,
          color: colors.text,
        },
        companyInfo: {
          fontSize: 9,
          marginBottom: 2,
          color: colors.textSecondary,
        },
        documentTitle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.primary,
          marginBottom: 4,
        },
        documentNumber: {
          fontSize: 11,
          color: colors.textSecondary,
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
          color: colors.text,
          textTransform: 'uppercase',
        },
        clientName: {
          fontSize: 11,
          fontWeight: 'bold',
          marginBottom: 3,
          color: colors.text,
        },
        text: {
          fontSize: 10,
          marginBottom: 2,
          color: colors.textLight,
        },

        // Table
        table: {
          marginTop: 10,
        },
        tableHeader: {
          flexDirection: 'row',
          backgroundColor: colors.backgroundAlt,
          borderBottomWidth: 2,
          borderBottomColor: colors.primary,
          paddingVertical: 8,
          paddingHorizontal: 8,
        },
        tableRow: {
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingVertical: 8,
          paddingHorizontal: 8,
          minHeight: 30,
        },
        tableColDescription: {
          width: '45%',
          fontSize: 9,
          color: colors.text,
        },
        tableColQuantity: {
          width: '15%',
          fontSize: 9,
          textAlign: 'center',
          color: colors.text,
        },
        tableColPrice: {
          width: '20%',
          fontSize: 9,
          textAlign: 'right',
          color: colors.text,
        },
        tableColTotal: {
          width: '20%',
          fontSize: 9,
          textAlign: 'right',
          fontWeight: 'bold',
          color: colors.text,
        },
        tableHeaderText: {
          fontWeight: 'bold',
          fontSize: 9,
          color: colors.text,
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
          color: colors.textSecondary,
        },
        totalValue: {
          fontSize: 10,
          fontWeight: 'bold',
          minWidth: 80,
          textAlign: 'right',
          color: colors.text,
        },
        totalFinal: {
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: 2,
          borderTopColor: colors.primary,
          minWidth: 250,
        },
        totalFinalLabel: {
          fontSize: 14,
          fontWeight: 'bold',
          marginRight: 20,
          color: colors.text,
        },
        totalFinalValue: {
          fontSize: 14,
          fontWeight: 'bold',
          minWidth: 80,
          textAlign: 'right',
          color: colors.primary,
        },

        // Footer sections
        footerSection: {
          marginTop: 15,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        footerTitle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginBottom: 5,
          color: colors.text,
          textTransform: 'uppercase',
        },
        footerText: {
          fontSize: 8,
          marginBottom: 2,
          color: colors.textSecondary,
          lineHeight: 1.4,
        },
        footerGrid: {
          flexDirection: 'row',
          gap: 20,
        },
        footerColumn: {
          flex: 1,
        },

        // Legal notice
        legalNotice: {
          marginTop: 20,
          padding: 10,
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        },
        legalText: {
          fontSize: 7,
          color: colors.textTertiary,
          lineHeight: 1.3,
          marginBottom: 2,
        },
      }),
    [styles, colors],
  )

  return (
    <Document>
      <Page size="A4" style={dynamicStyles.page}>
        {/* Warning for missing fields */}
        {config.missingFields.length > 0 && (
          <View style={dynamicStyles.warning}>
            <Text style={dynamicStyles.warningText}>
              ⚠️ INFORMATIONS OBLIGATOIRES MANQUANTES :{' '}
              {config.missingFields.map(f => f.label).join(', ')}
            </Text>
          </View>
        )}

        {/* Header */}
        {headerSection && (
          <View style={dynamicStyles.header}>
            <View style={dynamicStyles.headerLeft}>
              {headerSection.data.logo && (
                <Image src={headerSection.data.logo} style={dynamicStyles.logo} />
              )}
              <Text style={dynamicStyles.companyName}>{headerSection.data.companyName}</Text>
              {headerSection.data.legalForm && (
                <Text style={dynamicStyles.companyInfo}>
                  {headerSection.data.legalForm.toUpperCase()}
                  {headerSection.data.capital && ` - Capital : ${headerSection.data.capital}`}
                </Text>
              )}
              <Text style={dynamicStyles.companyInfo}>{headerSection.data.address}</Text>
              <Text style={dynamicStyles.companyInfo}>
                {headerSection.data.postalCode} {headerSection.data.city}
              </Text>
              {headerSection.data.phone && (
                <Text style={dynamicStyles.companyInfo}>Tél : {headerSection.data.phone}</Text>
              )}
              <Text style={dynamicStyles.companyInfo}>Email : {headerSection.data.email}</Text>
              <Text style={dynamicStyles.companyInfo}>SIRET : {headerSection.data.siret}</Text>
              {headerSection.data.vatNumber && (
                <Text style={dynamicStyles.companyInfo}>TVA : {headerSection.data.vatNumber}</Text>
              )}
              {headerSection.data.rcs && (
                <Text style={dynamicStyles.companyInfo}>{headerSection.data.rcs}</Text>
              )}
            </View>

            <View style={dynamicStyles.headerRight}>
              <Text style={dynamicStyles.documentTitle}>DEVIS</Text>
              <Text style={dynamicStyles.documentNumber}>
                N° {headerSection.data.documentNumber}
              </Text>
              <Text style={dynamicStyles.documentNumber}>
                Date : {headerSection.data.emissionDate}
              </Text>
              <Text style={dynamicStyles.documentNumber}>
                Valable jusqu'au : {headerSection.data.validityDate}
              </Text>
            </View>
          </View>
        )}

        {/* Client Section */}
        {clientSection && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Client</Text>
            <Text style={dynamicStyles.clientName}>{clientSection.data.name}</Text>
            <Text style={dynamicStyles.text}>{clientSection.data.address}</Text>
            <Text style={dynamicStyles.text}>{clientSection.data.email}</Text>
          </View>
        )}

        {/* Details Section */}
        {linesSection && (
          <View style={dynamicStyles.section}>
            <Text style={dynamicStyles.sectionTitle}>Détails des prestations</Text>

            <View style={dynamicStyles.table}>
              {/* Table Header */}
              <View style={dynamicStyles.tableHeader}>
                <Text style={[dynamicStyles.tableColDescription, dynamicStyles.tableHeaderText]}>
                  Description
                </Text>
                <Text style={[dynamicStyles.tableColQuantity, dynamicStyles.tableHeaderText]}>
                  Qté
                </Text>
                <Text style={[dynamicStyles.tableColPrice, dynamicStyles.tableHeaderText]}>
                  Prix unit. HT
                </Text>
                <Text style={[dynamicStyles.tableColTotal, dynamicStyles.tableHeaderText]}>
                  Total HT
                </Text>
              </View>

              {/* Table Rows */}
              {linesSection.data.map(line => (
                <View key={line.id} style={dynamicStyles.tableRow}>
                  <Text style={dynamicStyles.tableColDescription}>{line.description}</Text>
                  <Text style={dynamicStyles.tableColQuantity}>{line.quantity}</Text>
                  <Text style={dynamicStyles.tableColPrice}>{line.unitPrice.toFixed(2)} €</Text>
                  <Text style={dynamicStyles.tableColTotal}>{line.total.toFixed(2)} €</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Totals */}
        {totalsSection && (
          <View style={dynamicStyles.totalsSection}>
            <View style={dynamicStyles.totalRow}>
              <Text style={dynamicStyles.totalLabel}>Total HT</Text>
              <Text style={dynamicStyles.totalValue}>
                {totalsSection.data.subtotal.toFixed(2)} €
              </Text>
            </View>

            {totalsSection.data.vatNotApplicable ? (
              <View style={dynamicStyles.totalRow}>
                <Text style={dynamicStyles.totalLabel}>TVA non applicable</Text>
                <Text style={dynamicStyles.totalValue}>Art. 293 B du CGI</Text>
              </View>
            ) : (
              <View style={dynamicStyles.totalRow}>
                <Text style={dynamicStyles.totalLabel}>TVA ({totalsSection.data.vatRate}%)</Text>
                <Text style={dynamicStyles.totalValue}>
                  {totalsSection.data.vatAmount.toFixed(2)} €
                </Text>
              </View>
            )}

            <View style={dynamicStyles.totalFinal}>
              <Text style={dynamicStyles.totalFinalLabel}>Total TTC</Text>
              <Text style={dynamicStyles.totalFinalValue}>
                {totalsSection.data.totalTTC.toFixed(2)} €
              </Text>
            </View>

            {totalsSection.data.depositRequired && totalsSection.data.depositAmount > 0 && (
              <View style={dynamicStyles.totalRow}>
                <Text style={dynamicStyles.totalLabel}>
                  Acompte à la commande ({totalsSection.data.depositPercentage}%)
                </Text>
                <Text style={dynamicStyles.totalValue}>
                  {totalsSection.data.depositAmount.toFixed(2)} €
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer - Payment Conditions */}
        {paymentSection && (
          <View style={dynamicStyles.footerSection}>
            <Text style={dynamicStyles.footerTitle}>Conditions de règlement</Text>
            <View style={dynamicStyles.footerGrid}>
              <View style={dynamicStyles.footerColumn}>
                <Text style={dynamicStyles.footerText}>
                  • Conditions : {paymentSection.data.paymentTerms}
                </Text>
                <Text style={dynamicStyles.footerText}>
                  • Modes de paiement : {paymentSection.data.paymentMethods}
                </Text>
                {paymentSection.data.depositRequired && (
                  <Text style={dynamicStyles.footerText}>
                    • Acompte requis : {paymentSection.data.depositPercentage}% à la commande
                  </Text>
                )}
              </View>

              {bankingSection && (
                <View style={dynamicStyles.footerColumn}>
                  {bankingSection.data.bankName && (
                    <Text style={dynamicStyles.footerText}>
                      • Banque : {bankingSection.data.bankName}
                    </Text>
                  )}
                  {bankingSection.data.iban && (
                    <Text style={dynamicStyles.footerText}>
                      • IBAN : {bankingSection.data.iban}
                    </Text>
                  )}
                  {bankingSection.data.bic && (
                    <Text style={dynamicStyles.footerText}>• BIC : {bankingSection.data.bic}</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer - Insurance */}
        {insuranceSection && (
          <View style={dynamicStyles.footerSection}>
            <Text style={dynamicStyles.footerTitle}>Assurance décennale</Text>
            {insuranceSection.data.insurerName && (
              <Text style={dynamicStyles.footerText}>
                • Assureur : {insuranceSection.data.insurerName}
              </Text>
            )}
            {insuranceSection.data.policyNumber && (
              <Text style={dynamicStyles.footerText}>
                • N° de police : {insuranceSection.data.policyNumber}
              </Text>
            )}
            {insuranceSection.data.coverageZone && (
              <Text style={dynamicStyles.footerText}>
                • Zone de couverture : {insuranceSection.data.coverageZone}
              </Text>
            )}
          </View>
        )}

        {/* Custom Footer Text */}
        {customSection && (
          <View style={dynamicStyles.footerSection}>
            <Text style={dynamicStyles.footerTitle}>Informations complémentaires</Text>
            <Text style={dynamicStyles.footerText}>{customSection.data.text}</Text>
          </View>
        )}

        {/* Legal Notice */}
        {legalSection && (
          <View style={dynamicStyles.legalNotice}>
            <Text style={dynamicStyles.legalText}>
              • En cas de retard de paiement : {legalSection.data.latePenaltyRate}
            </Text>
            <Text style={dynamicStyles.legalText}>
              • Indemnité forfaitaire de recouvrement : {legalSection.data.recoveryFee} € (art.
              L441-6 et D441-5 du Code de commerce)
            </Text>
            <Text style={dynamicStyles.legalText}>
              • Devis valable {legalSection.data.quoteValidityDays} jours à compter de la date
              d'émission
            </Text>
            <Text style={dynamicStyles.legalText}>
              • Acceptation du devis : signature précédée de la mention "Bon pour accord"
            </Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
