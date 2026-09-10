# Générateur de devis

Un devis ou une facture se rédige en le **décrivant**, au clavier ou à la voix.
L'IA remplit le document, qui s'affiche à côté en aperçu PDF et reste éditable
champ par champ — on corrige un prix, une remise ou un intitulé directement dans
la page, sans repasser par le chat.

Interface en deux panneaux : la conversation à gauche, le document à droite.

## Comment ça marche

1. **Réglages** — une fois pour toutes : société, coordonnées bancaires, produits
   et prestations, conditions, remises, assurance, logo, et la clé d'API du
   fournisseur d'IA choisi.
2. **Description** — on dicte ou on écrit la prestation dans le chat.
3. **Génération** — le fournisseur d'IA renvoie un document structuré, appliqué
   au gabarit.
4. **Retouche** — chaque champ de l'aperçu est éditable, remises comprises.
5. **Export** — PDF via `@react-pdf/renderer`, ou partage direct.

## Fournisseurs d'IA

Cinq fournisseurs derrière une interface commune (`src/ai/providers/`), choisis
dans les réglages : **Claude** (Anthropic), **OpenAI**, **Gemini** (Google),
**Mistral** et **Groq**. Ajouter un fournisseur consiste à implémenter
`base.provider.ts` et à l'enregistrer dans `registry.provider.ts`.

> **Les clés d'API restent dans le navigateur.** Elles sont saisies dans les
> réglages et conservées en `localStorage` par le store Zustand persisté
> (`company-settings-storage`) : rien ne transite par un serveur intermédiaire,
> mais rien n'est chiffré non plus. C'est une application entièrement côté
> client, à utiliser avec ses propres clés sur sa propre machine.

## Saisie vocale

`VoiceChatInput` accepte la dictée en plus du clavier, avec restitution vocale
des réponses (`speech-advanced.service.ts`, `textToSpeech.service.ts`), et un
sélecteur de mode pour basculer entre les deux.

## Stack

- **React 19** et **Vite 7**, TypeScript en mode strict
- **Zustand** (avec `persist`) pour l'état : chat, document, réglages, voix, auth
- **Zod** et **react-hook-form** pour la validation des réglages, un schéma par
  onglet (`src/features/settings/schemas/`)
- **@react-pdf/renderer** pour l'export, gabarits sous
  `src/features/preview/templates/`
- **Tailwind CSS 4** et **DaisyUI**, icônes Lucide
- **Supabase** pour l'authentification
- **Lemon Squeezy** pour les achats et l'abonnement (`src/utils/access.util.ts`)
- **react-ga4** pour la mesure d'audience, **react-share** pour le partage
- ESLint avec `react-hooks`, `jsx-a11y`, `unused-imports`, `--max-warnings=0`

## Démarrer

```bash
pnpm install
pnpm start        # Vite, HTTPS local via les certificats de certs/
```

| Script | Rôle |
| --- | --- |
| `pnpm start` | serveur de développement |
| `pnpm build` | `tsc -b` puis build de production |
| `pnpm preview` | prévisualisation du build |
| `pnpm lint` / `lint:fix` | ESLint, zéro avertissement toléré |
| `pnpm format` / `format:fix` | Prettier |

La clé d'API du fournisseur d'IA se renseigne **dans l'application**, onglet API
des réglages — il n'y a pas de variable d'environnement à poser.

## Structure

```
src/
├── ai/
│   ├── ai.service.ts        orchestration de l'appel
│   ├── ai.prompt.ts         le prompt de génération du document
│   └── providers/           un fichier par fournisseur + registre
├── features/
│   ├── chat/                conversation, saisie texte et vocale
│   ├── preview/             aperçu, champs éditables, gabarits PDF
│   └── settings/            onglets de réglages, schémas Zod, store
├── components/              Button, Panel, BuyButton, ShareButton
├── hooks/                   export PDF, raccourcis clavier, ouverture des panneaux
├── services/                auth Supabase, synthèse et reconnaissance vocale
├── stores/                  état Zustand
└── utils/                   accès premium, images, Supabase, classes CSS
```

## Licence

Propriétaire, tous droits réservés. Voir [LICENSE](LICENSE).
