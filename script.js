/**
 * Ultimate Image Converter Pro
 * Advanced image conversion and editing tool
 * © 2025 - All processing happens client-side
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==================== DOM Elements ====================
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const filesList = document.getElementById("files-list");
  const previewContainer = document.getElementById("preview-container");
  const formatSelect = document.getElementById("format-select");
  const qualitySlider = document.getElementById("quality-slider");
  const qualityValue = document.getElementById("quality-value");
  const convertBtn = document.getElementById("convert-btn");
  const resetBtn = document.getElementById("reset-btn");
  const clearBtn = document.getElementById("clear-btn");
  const progressBar = document.getElementById("progress-bar");
  const progressContainer = document.getElementById("progress-container");
  const progressText = document.getElementById("progress-text");
  const progressPercentage = document.getElementById("progress-percentage");
  const conversionResults = document.getElementById("conversion-results");
  const downloadAllBtn = document.getElementById("download-all-btn");
  const compareToggle = document.getElementById("compare-toggle");
  const themeToggle = document.getElementById("theme-toggle");
  
  // Resize elements
  const enableResize = document.getElementById("enable-resize");
  const maintainAspect = document.getElementById("maintain-aspect");
  const widthInput = document.getElementById("width-input");
  const heightInput = document.getElementById("height-input");
  const scalePercentage = document.getElementById("scale-percentage");
  const resizeInputs = document.getElementById("resize-inputs");
  
  // Adjustment elements
  const rotationSelect = document.getElementById("rotation-select");
  const flipSelect = document.getElementById("flip-select");
  const brightnessSlider = document.getElementById("brightness-slider");
  const brightnessValue = document.getElementById("brightness-value");
  const contrastSlider = document.getElementById("contrast-slider");
  const contrastValue = document.getElementById("contrast-value");
  const saturationSlider = document.getElementById("saturation-slider");
  const saturationValue = document.getElementById("saturation-value");
  const blurSlider = document.getElementById("blur-slider");
  const blurValue = document.getElementById("blur-value");
  
  // Filter elements
  const filterButtons = document.querySelectorAll(".filter-btn");
  
  // Watermark elements
  const enableWatermark = document.getElementById("enable-watermark");
  const watermarkText = document.getElementById("watermark-text");
  const watermarkPosition = document.getElementById("watermark-position");
  const watermarkOpacity = document.getElementById("watermark-opacity");
  const watermarkOpacityValue = document.getElementById("watermark-opacity-value");
  const watermarkInputs = document.getElementById("watermark-inputs");
  
  // Stats elements
  const totalFiles = document.getElementById("total-files");
  const totalSaved = document.getElementById("total-saved");

  // ==================== State Variables ====================
  let uploadedFiles = [];
  let convertedFiles = [];
  let selectedFilter = "none";
  let showComparison = false;

  // ==================== Initialization ====================
  initializeApp();

  function initializeApp() {
    // Load theme preference
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);
    
    // Initialize slider values
    updateSliderValue(qualitySlider, qualityValue);
    updateSliderValue(brightnessSlider, brightnessValue);
    updateSliderValue(contrastSlider, contrastValue);
    updateSliderValue(saturationSlider, saturationValue);
    updateSliderValue(blurSlider, blurValue);
    updateSliderValue(watermarkOpacity, watermarkOpacityValue);
    
    // Hide optional sections initially
    resizeInputs.style.display = "none";
    watermarkInputs.style.display = "none";
    progressContainer.style.display = "none";
    conversionResults.style.display = "none";
    
    setupEventListeners();
  }

  // ==================== Event Listeners Setup ====================
  function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener("click", toggleTheme);
    
    // File upload
    dropArea.addEventListener("click", () => fileInput.click());
    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("dragleave", handleDragLeave);
    dropArea.addEventListener("drop", handleDrop);
    fileInput.addEventListener("change", handleFileSelect);
    
    // Keyboard accessibility for drop area
    dropArea.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fileInput.click();
      }
    });
    
    // Sliders
    qualitySlider.addEventListener("input", () => updateSliderValue(qualitySlider, qualityValue));
    brightnessSlider.addEventListener("input", () => updateSliderValue(brightnessSlider, brightnessValue));
    contrastSlider.addEventListener("input", () => updateSliderValue(contrastSlider, contrastValue));
    saturationSlider.addEventListener("input", () => updateSliderValue(saturationSlider, saturationValue));
    blurSlider.addEventListener("input", () => updateSliderValue(blurSlider, blurValue));
    watermarkOpacity.addEventListener("input", () => updateSliderValue(watermarkOpacity, watermarkOpacityValue));
    
    // Resize settings
    enableResize.addEventListener("change", toggleResizeInputs);
    maintainAspect.addEventListener("change", handleAspectRatioToggle);
    widthInput.addEventListener("input", handleDimensionChange);
    heightInput.addEventListener("input", handleDimensionChange);
    scalePercentage.addEventListener("input", handleScaleChange);
    
    // Watermark settings
    enableWatermark.addEventListener("change", toggleWatermarkInputs);
    
    // Filter buttons
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedFilter = btn.dataset.filter;
      });
    });
    
    // Action buttons
    convertBtn.addEventListener("click", startConversion);
    resetBtn.addEventListener("click", resetSettings);
    clearBtn.addEventListener("click", clearAll);
    downloadAllBtn.addEventListener("click", downloadAllAsZip);
    compareToggle.addEventListener("click", toggleComparison);
  }

  // ==================== Theme Management ====================
  function toggleTheme() {
    const currentTheme = document.body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  // ==================== File Upload Handlers ====================
  function handleDragOver(e) {
    e.preventDefault();
    dropArea.classList.add("active");
  }

  function handleDragLeave() {
    dropArea.classList.remove("active");
  }

  function handleDrop(e) {
    e.preventDefault();
    dropArea.classList.remove("active");
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      addFiles(files);
    } else {
      showNotification("Please drop valid image files", "error");
    }
  }

  function handleFileSelect() {
    const files = Array.from(fileInput.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      addFiles(files);
    }
    fileInput.value = "";
  }

  function addFiles(files) {
    let addedCount = 0;
    files.forEach(file => {
      if (!uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
        uploadedFiles.push(file);
        displayFileInList(file);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      showNotification(`${addedCount} file(s) added successfully`, "success");
    }
  }

  function displayFileInList(file) {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.setAttribute("role", "listitem");

    // Create thumbnail
    const thumbnail = document.createElement("img");
    thumbnail.className = "file-thumbnail";
    thumbnail.alt = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      thumbnail.src = e.target.result;
    };
    reader.readAsDataURL(file);

    const fileInfo = document.createElement("div");
    fileInfo.className = "file-info";

    const fileName = document.createElement("div");
    fileName.className = "file-name";
    fileName.textContent = file.name;

    const fileSize = document.createElement("div");
    fileSize.className = "file-size";
    fileSize.textContent = formatFileSize(file.size);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-file";
    removeBtn.innerHTML = "&times;";
    removeBtn.setAttribute("aria-label", `Remove ${file.name}`);
    removeBtn.addEventListener("click", () => {
      uploadedFiles = uploadedFiles.filter(f => f !== file);
      fileItem.remove();
      showNotification("File removed", "info");
    });

    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileSize);
    fileItem.appendChild(thumbnail);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeBtn);
    filesList.appendChild(fileItem);
  }

  // ==================== Settings Handlers ====================
  function updateSliderValue(slider, display) {
    display.textContent = slider.value;
  }

  function toggleResizeInputs() {
    resizeInputs.style.display = enableResize.checked ? "flex" : "none";
  }

  function toggleWatermarkInputs() {
    watermarkInputs.style.display = enableWatermark.checked ? "flex" : "none";
  }

  function handleAspectRatioToggle() {
    if (maintainAspect.checked && widthInput.value) {
      calculateProportionalHeight();
    }
  }

  function handleDimensionChange(e) {
    if (maintainAspect.checked && uploadedFiles.length > 0) {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (e.target === widthInput && widthInput.value) {
            heightInput.value = Math.round(widthInput.value / aspectRatio);
          } else if (e.target === heightInput && heightInput.value) {
            widthInput.value = Math.round(heightInput.value * aspectRatio);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(uploadedFiles[0]);
    }
  }

  function handleScaleChange() {
    if (scalePercentage.value && uploadedFiles.length > 0) {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        img.onload = () => {
          const scale = parseFloat(scalePercentage.value) / 100;
          widthInput.value = Math.round(img.width * scale);
          heightInput.value = Math.round(img.height * scale);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(uploadedFiles[0]);
    }
  }

  function calculateProportionalHeight() {
    if (uploadedFiles.length > 0 && widthInput.value) {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (event) => {
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          heightInput.value = Math.round(widthInput.value / aspectRatio);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(uploadedFiles[0]);
    }
  }

  function resetSettings() {
    qualitySlider.value = 85;
    rotationSelect.value = "0";
    flipSelect.value = "none";
    brightnessSlider.value = 100;
    contrastSlider.value = 100;
    saturationSlider.value = 100;
    blurSlider.value = 0;
    enableResize.checked = false;
    maintainAspect.checked = true;
    widthInput.value = "";
    heightInput.value = "";
    scalePercentage.value = "";
    enableWatermark.checked = false;
    watermarkText.value = "";
    watermarkOpacity.value = 50;
    
    updateSliderValue(qualitySlider, qualityValue);
    updateSliderValue(brightnessSlider, brightnessValue);
    updateSliderValue(contrastSlider, contrastValue);
    updateSliderValue(saturationSlider, saturationValue);
    updateSliderValue(blurSlider, blurValue);
    updateSliderValue(watermarkOpacity, watermarkOpacityValue);
    
    filterButtons.forEach(b => b.classList.remove("active"));
    filterButtons[0].classList.add("active");
    selectedFilter = "none";
    
    toggleResizeInputs();
    toggleWatermarkInputs();
    
    showNotification("Settings reset to default", "info");
  }

  function clearAll() {
    if (uploadedFiles.length === 0 && convertedFiles.length === 0) {
      showNotification("Nothing to clear", "info");
      return;
    }
    
    uploadedFiles = [];
    convertedFiles = [];
    filesList.innerHTML = "";
    previewContainer.innerHTML = "";
    conversionResults.style.display = "none";
    
    showNotification("All files cleared", "success");
  }

  // ==================== Image Conversion ====================
  async function startConversion() {
    if (uploadedFiles.length === 0) {
      showNotification("Please upload images first!", "error");
      return;
    }

    // Reset previous results
    previewContainer.innerHTML = "";
    convertedFiles = [];
    conversionResults.style.display = "none";
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    progressPercentage.textContent = "0%";

    const settings = gatherSettings();
    let totalSavings = 0;

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        progressText.textContent = `Processing ${file.name}...`;
        
        const result = await convertImage(file, settings);
        convertedFiles.push(result);
        
        totalSavings += (file.size - result.size);
        
        createPreviewItem(result, file);
        
        const percentage = Math.round(((i + 1) / uploadedFiles.length) * 100);
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
      }

      // Show results
      conversionResults.style.display = "block";
      totalFiles.textContent = `${convertedFiles.length} file${convertedFiles.length !== 1 ? 's' : ''}`;
      totalSaved.textContent = totalSavings > 0 
        ? `${formatFileSize(totalSavings)} saved` 
        : `${formatFileSize(Math.abs(totalSavings))} increase`;
      
      progressText.textContent = "Conversion complete!";
      
      setTimeout(() => {
        progressContainer.style.display = "none";
      }, 2000);
      
      showNotification("All images converted successfully!", "success");
    } catch (error) {
      console.error("Conversion error:", error);
      showNotification("Error during conversion", "error");
      progressContainer.style.display = "none";
    }
  }

  function gatherSettings() {
    return {
      format: formatSelect.value,
      quality: parseInt(qualitySlider.value) / 100,
      resize: enableResize.checked ? {
        width: widthInput.value ? parseInt(widthInput.value) : null,
        height: heightInput.value ? parseInt(heightInput.value) : null,
        maintainAspect: maintainAspect.checked
      } : null,
      rotation: parseInt(rotationSelect.value),
      flip: flipSelect.value,
      brightness: parseInt(brightnessSlider.value),
      contrast: parseInt(contrastSlider.value),
      saturation: parseInt(saturationSlider.value),
      blur: parseInt(blurSlider.value),
      filter: selectedFilter,
      watermark: enableWatermark.checked ? {
        text: watermarkText.value || "© Watermark",
        position: watermarkPosition.value,
        opacity: parseInt(watermarkOpacity.value) / 100
      } : null
    };
  }

  async function convertImage(file, settings) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Calculate dimensions
            let width = img.width;
            let height = img.height;

            if (settings.resize) {
              if (settings.resize.width && settings.resize.height) {
                width = settings.resize.width;
                height = settings.resize.height;
              } else if (settings.resize.width) {
                width = settings.resize.width;
                height = settings.resize.maintainAspect 
                  ? Math.round((img.height / img.width) * width)
                  : img.height;
              } else if (settings.resize.height) {
                height = settings.resize.height;
                width = settings.resize.maintainAspect 
                  ? Math.round((img.width / img.height) * height)
                  : img.width;
              }
            }

            // Handle rotation
            if (settings.rotation === 90 || settings.rotation === 270) {
              canvas.width = height;
              canvas.height = width;
            } else {
              canvas.width = width;
              canvas.height = height;
            }

            // Apply transformations
            ctx.save();
            
            // Rotation
            if (settings.rotation !== 0) {
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.rotate((settings.rotation * Math.PI) / 180);
              ctx.translate(-width / 2, -height / 2);
            }

            // Flip
            if (settings.flip !== "none") {
              ctx.translate(
                settings.flip === "horizontal" || settings.flip === "both" ? width : 0,
                settings.flip === "vertical" || settings.flip === "both" ? height : 0
              );
              ctx.scale(
                settings.flip === "horizontal" || settings.flip === "both" ? -1 : 1,
                settings.flip === "vertical" || settings.flip === "both" ? -1 : 1
              );
            }

            // Apply filters
            let filterString = "";
            if (settings.brightness !== 100) {
              filterString += `brightness(${settings.brightness}%) `;
            }
            if (settings.contrast !== 100) {
              filterString += `contrast(${settings.contrast}%) `;
            }
            if (settings.saturation !== 100) {
              filterString += `saturate(${settings.saturation}%) `;
            }
            if (settings.blur > 0) {
              filterString += `blur(${settings.blur}px) `;
            }

            // Apply preset filters
            switch (settings.filter) {
              case "grayscale":
                filterString += "grayscale(100%) ";
                break;
              case "sepia":
                filterString += "sepia(100%) ";
                break;
              case "invert":
                filterString += "invert(100%) ";
                break;
              case "vintage":
                filterString += "sepia(50%) contrast(120%) brightness(90%) ";
                break;
            }

            if (filterString) {
              ctx.filter = filterString;
            }

            // Draw image
            ctx.drawImage(img, 0, 0, width, height);
            ctx.restore();

            // Add watermark
            if (settings.watermark) {
              applyWatermark(ctx, canvas, settings.watermark);
            }

            // Determine MIME type
            const mimeType = getMimeType(settings.format);

            // Convert to blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve({
                    blob: blob,
                    name: generateFileName(file.name, settings.format),
                    originalName: file.name,
                    width: canvas.width,
                    height: canvas.height,
                    size: blob.size,
                    originalSize: file.size
                  });
                } else {
                  reject(new Error("Failed to create blob"));
                }
              },
              mimeType,
              settings.quality
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = event.target.result;
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  function applyWatermark(ctx, canvas, watermark) {
    ctx.save();
    ctx.globalAlpha = watermark.opacity;
    
    const fontSize = Math.max(canvas.width / 30, 16);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    
    const textMetrics = ctx.measureText(watermark.text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;
    
    let x, y;
    const padding = 20;
    
    switch (watermark.position) {
      case "top-left":
        x = padding;
        y = padding + textHeight;
        break;
      case "top-right":
        x = canvas.width - textWidth - padding;
        y = padding + textHeight;
        break;
      case "bottom-left":
        x = padding;
        y = canvas.height - padding;
        break;
      case "bottom-right":
        x = canvas.width - textWidth - padding;
        y = canvas.height - padding;
        break;
      case "center":
        x = (canvas.width - textWidth) / 2;
        y = canvas.height / 2;
        break;
    }
    
    ctx.strokeText(watermark.text, x, y);
    ctx.fillText(watermark.text, x, y);
    ctx.restore();
  }

  function getMimeType(format) {
    const mimeTypes = {
      jpg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      avif: "image/avif",
      bmp: "image/bmp"
    };
    return mimeTypes[format] || "image/jpeg";
  }

  function generateFileName(originalName, format) {
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    return `${nameWithoutExt}_converted.${format}`;
  }

  // ==================== Preview and Display ====================
  function createPreviewItem(result, originalFile) {
    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    previewItem.setAttribute("role", "listitem");

    if (showComparison) {
      // Comparison view
      const comparisonContainer = document.createElement("div");
      comparisonContainer.className = "comparison-container";

      const originalImg = document.createElement("img");
      originalImg.className = "preview-img";
      originalImg.src = URL.createObjectURL(originalFile);
      originalImg.alt = "Original";

      const convertedImg = document.createElement("img");
      convertedImg.className = "preview-img";
      convertedImg.src = URL.createObjectURL(result.blob);
      convertedImg.alt = "Converted";

      const originalLabel = document.createElement("div");
      originalLabel.className = "image-label";
      originalLabel.textContent = "Original";

      const convertedLabel = document.createElement("div");
      convertedLabel.className = "image-label";
      convertedLabel.textContent = "Converted";

      const originalWrapper = document.createElement("div");
      originalWrapper.className = "image-wrapper";
      originalWrapper.appendChild(originalImg);
      originalWrapper.appendChild(originalLabel);

      const convertedWrapper = document.createElement("div");
      convertedWrapper.className = "image-wrapper";
      convertedWrapper.appendChild(convertedImg);
      convertedWrapper.appendChild(convertedLabel);

      comparisonContainer.appendChild(originalWrapper);
      comparisonContainer.appendChild(convertedWrapper);
      previewItem.appendChild(comparisonContainer);
    } else {
      // Regular view
      const img = document.createElement("img");
      img.className = "preview-img";
      img.src = URL.createObjectURL(result.blob);
      img.alt = result.name;
      previewItem.appendChild(img);
    }

    // Details section
    const details = document.createElement("div");
    details.className = "preview-details";

    const filename = document.createElement("div");
    filename.className = "preview-filename";
    filename.textContent = result.name;

    const info = document.createElement("div");
    info.className = "preview-info";
    
    const sizeDiff = result.size - result.originalSize;
    const sizeChange = sizeDiff > 0 
      ? `+${formatFileSize(sizeDiff)}` 
      : formatFileSize(Math.abs(sizeDiff));
    const sizeColor = sizeDiff > 0 ? "red" : "green";
    
    info.innerHTML = `
      <div><strong>Original:</strong> ${originalFile.name}</div>
      <div><strong>Dimensions:</strong> ${result.width} × ${result.height}</div>
      <div><strong>Original Size:</strong> ${formatFileSize(result.originalSize)}</div>
      <div><strong>New Size:</strong> ${formatFileSize(result.size)} <span style="color: ${sizeColor}">(${sizeChange})</span></div>
    `;

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "download-btn";
    downloadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download
    `;
    downloadBtn.addEventListener("click", () => downloadFile(result));

    details.appendChild(filename);
    details.appendChild(info);
    details.appendChild(downloadBtn);
    previewItem.appendChild(details);

    previewContainer.appendChild(previewItem);
  }

  function toggleComparison() {
    showComparison = !showComparison;
    
    // Recreate previews with new mode
    if (convertedFiles.length > 0) {
      previewContainer.innerHTML = "";
      convertedFiles.forEach((result, index) => {
        createPreviewItem(result, uploadedFiles[index]);
      });
    }
    
    compareToggle.textContent = showComparison ? "Hide Comparison" : "Show Comparison";
  }

  // ==================== Download Functions ====================
  function downloadFile(result) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(result.blob);
    link.download = result.name;
    link.click();
    showNotification(`Downloading ${result.name}`, "success");
  }

  async function downloadAllAsZip() {
    if (convertedFiles.length === 0) {
      showNotification("No converted images to download", "error");
      return;
    }

    try {
      showNotification("Creating ZIP file...", "info");
      
      const zip = new JSZip();
      const folder = zip.folder("converted_images");

      convertedFiles.forEach((file) => {
        folder.file(file.name, file.blob);
      });

      const content = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 9 }
      });

      saveAs(content, `converted_images_${Date.now()}.zip`);
      showNotification("ZIP file downloaded successfully!", "success");
    } catch (error) {
      console.error("ZIP generation error:", error);
      showNotification("Error creating ZIP file", "error");
    }
  }

  // ==================== Utility Functions ====================
  function formatFileSize(bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(1) + " KB";
    } else {
      return (bytes / 1048576).toFixed(2) + " MB";
    }
  }

  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add("show"), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
});
