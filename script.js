const dropZone = document.querySelector('#drop-zone');
const fileInput = document.querySelector('#file-input');
const previewGrid = document.querySelector('#preview-grid');
const photoCount = document.querySelector('#photo-count');
const selectionSize = document.querySelector('#selection-size');
const clearButton = document.querySelector('#clear-button');
const uploadButton = document.querySelector('#upload-button');
const statusMessage = document.querySelector('#status-message');

const maxFileSize = 10 * 1024 * 1024;
let selectedFiles = [];

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function addFiles(fileList) {
  const validFiles = [...fileList].filter((file) => file.type.startsWith('image/') && file.size <= maxFileSize);
  const rejectedCount = fileList.length - validFiles.length;
  const existingNames = new Set(selectedFiles.map((file) => `${file.name}-${file.size}`));

  selectedFiles = [...selectedFiles, ...validFiles.filter((file) => !existingNames.has(`${file.name}-${file.size}`))];
  statusMessage.textContent = rejectedCount ? `${rejectedCount} file${rejectedCount === 1 ? '' : 's'} skipped. Images must be under 10 MB.` : '';
  renderPreviews();
}

function renderPreviews() {
  previewGrid.replaceChildren();
  selectedFiles.forEach((file, index) => {
    const card = document.createElement('div');
    card.className = 'preview-card';
    card.style.animationDelay = `${index * 45}ms`;

    const image = document.createElement('img');
    image.src = URL.createObjectURL(file);
    image.alt = file.name;

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.type = 'button';
    removeButton.setAttribute('aria-label', `Remove ${file.name}`);
    removeButton.textContent = '×';
    removeButton.addEventListener('click', () => {
      selectedFiles.splice(index, 1);
      renderPreviews();
    });

    card.append(image, removeButton);
    previewGrid.append(card);
  });

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  photoCount.textContent = selectedFiles.length;
  selectionSize.textContent = selectedFiles.length ? `${formatSize(totalSize)} total` : 'No photos added yet';
  clearButton.hidden = selectedFiles.length === 0;
  uploadButton.disabled = selectedFiles.length === 0;
}

fileInput.addEventListener('click', (event) => event.stopPropagation());
fileInput.addEventListener('change', (event) => addFiles(event.target.files));
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') fileInput.click();
});
['dragenter', 'dragover'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.remove('is-dragging');
}));
dropZone.addEventListener('drop', (event) => addFiles(event.dataTransfer.files));
clearButton.addEventListener('click', () => {
  selectedFiles = [];
  fileInput.value = '';
  statusMessage.textContent = '';
  renderPreviews();
});
uploadButton.addEventListener('click', () => {
  statusMessage.textContent = `${selectedFiles.length} photo${selectedFiles.length === 1 ? '' : 's'} ready to upload.`;
});