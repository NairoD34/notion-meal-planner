# Utiliser l'image Node.js officielle
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3001

# Démarrer l'application
CMD ["node", "server.js"]
