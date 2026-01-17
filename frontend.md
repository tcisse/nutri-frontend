Agis comme un Senior Frontend Developer expert en Next.js 14, React Query et Tailwind.
Je veux construire l'interface d'une application de nutrition. Le Backend est prêt (Node.js) et sert les données.

### STACK TECHNIQUE (Strict)
- **Package Manager** : pnpm
- **Framework** : Next.js 14 (App Router)
- **State Management (Server)** : @tanstack/react-query (v5)
- **HTTP Client** : axios
- **UI Library** : Shadcn UI + Tailwind CSS + Lucide React
- **Forms** : React Hook Form + Zod

### ARCHITECTURE REACT QUERY
1. Crée un `QueryProvider` (client component) pour envelopper l'application dans `layout.tsx`.
2. Utilise `useMutation` pour le formulaire d'Onboarding (POST /api/calculate).
3. Utilise `useQuery` pour l'affichage du Dashboard (GET/POST /api/menu).
4. Pour la feature "Changer de plat", utilise `useMutation` qui invalide ou met à jour le cache local du menu sans recharger toute la page.

### PAGES & FONCTIONNALITÉS
1. **Onboarding (Wizard)**
   - Formulaire multi-étapes (Sexe -> Age/Poids/Taille -> Activité -> Objectif -> Pays).
   - Stocke les réponses temporaires dans un store local (ou URL params) avant le submit final.
   - Au submit : Appelle l'API via Axios + Mutation.

2. **Dashboard (Le Plan Alimentaire)**
   - Affiche le résultat calorique (ex: "1500 Kcal").
   - Affiche 4 blocs : Matin, Collation, Midi, Soir.
   - Affiche les aliments calculés (ex: "3 portions de Riz").
   - **Feature Clé** : Bouton "Changer" à côté de chaque aliment.
     - *Logique UX* : Au clic, fait un appel API pour swap l'aliment, montre un spinner local, et met à jour juste cette ligne.

### DESIGN SYSTEM
- Look : "Clean Health App". Fond blanc, accents verts, typographie lisible (Inter).
- Mobile First : Les cartes de repas doivent être empilées sur mobile et en grille sur Desktop.

### INSTRUCTIONS DE DÉMARRAGE
1. Donne-moi d'abord les commandes `pnpm` pour installer toutes les dépendances (Shadcn, Axios, Tanstack Query).
2. Code le `QueryProvider`.
3. Code le service API (`lib/api.ts`) avec Axios.
4. Code le formulaire d'Onboarding.