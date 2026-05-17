const downloadBtn = document.getElementById('downloadBtn');
const urlInput = document.getElementById('url');
const formatSelect = document.getElementById('format');
const statusDiv = document.getElementById('status');
const folderBtn = document.getElementById('folderBtn');
const folderPathInput = document.getElementById('folderPath');
const filenameInput = document.getElementById('filename');
const themeToggleBtn = document.getElementById('themeToggle');

// --- GESTION DU THÈME SOMBRE ---
// 1. On regarde si l'utilisateur a sauvegardé un choix précédent
const savedTheme = localStorage.getItem('theme');
// 2. On regarde la préférence de son système (Windows/Mac)
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Application du thème au lancement
if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggleBtn.innerText = '☀️';
} else {
  themeToggleBtn.innerText = '🌙';
}

// Fonction pour changer le thème au clic du bouton
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    themeToggleBtn.innerText = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeToggleBtn.innerText = '☀️';
  }
});

let selectedDirectory = '';

folderBtn.addEventListener('click', async () => {
  const folder = await window.api.selectFolder();
  if (folder) {
    selectedDirectory = folder;
    folderPathInput.value = folder;
  }
});

downloadBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  const format = formatSelect.value;
  const filename = filenameInput.value.trim();

  if (!url) {
    statusDiv.style.display = 'block';
    statusDiv.className = 'status-error';
    statusDiv.innerText = 'Veuillez entrer une URL YouTube valide.';
    return;
  }

  if (!selectedDirectory) {
    statusDiv.style.display = 'block';
    statusDiv.className = 'status-error';
    statusDiv.innerText = 'Veuillez choisir un dossier de sauvegarde.';
    return;
  }

  statusDiv.style.display = 'block';
  statusDiv.className = 'status-info';
  statusDiv.innerText = 'Conversion en cours... Veuillez patienter.';
  downloadBtn.disabled = true;

  try {
    const response = await window.api.downloadVideo(url, format, selectedDirectory, filename);
    
    if (response.success) {
      statusDiv.className = 'status-success';
      statusDiv.innerText = 'Téléchargement terminé avec succès !';
    } else {
      statusDiv.className = 'status-error';
      statusDiv.innerText = 'Erreur : ' + response.error;
    }
  } catch (error) {
    statusDiv.className = 'status-error';
    statusDiv.innerText = 'Une erreur inattendue est survenue.';
  } finally {
    downloadBtn.disabled = false;
  }
});
