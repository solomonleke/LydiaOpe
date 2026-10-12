import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Video,
  UploadCloud,
  Sparkles,
  Heart,
  X,
  FileSpreadsheet,
  Play,
  CheckCircle2,
  Loader2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Plus,
  Trash2,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeddingMediaItem, WeddingMediaCategory } from '../types/wedding';
import { INITIAL_WEDDING_MEMORIES } from '../data/weddingData';
import {
  fetchMediaVaultItems,
  uploadMediaVaultItem,
  bulkUploadMediaVaultItems,
  likeMediaVaultItem,
  exportVaultToExcel,
  extractDriveId,
  combineUniqueMediaItems
} from '../services/mediaVaultService';

interface WeddingMemoryVaultProps {
  onCountChange?: (count: number) => void;
}

export const WeddingMemoryVault: React.FC<WeddingMemoryVaultProps> = ({ onCountChange }) => {
  const [items, setItems] = useState<WeddingMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [catFilter, setCatFilter] = useState<WeddingMediaCategory | 'all'>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [forceEmbedPlayer, setForceEmbedPlayer] = useState(false);

  // Upload Mode: 'single' | 'bulk'
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single');

  // Single file state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Bulk queued files state
  interface QueuedBulkFile {
    id: string;
    file: File;
    previewUrl: string;
    isVideo: boolean;
    status: 'idle' | 'uploading' | 'done' | 'error';
    error?: string;
  }
  const [bulkFiles, setBulkFiles] = useState<QueuedBulkFile[]>([]);
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
    currentName: string;
    percent: number;
  } | null>(null);
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState('');
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  // Common metadata
  const [author, setAuthor] = useState('');
  const [relationship, setRelationship] = useState('');
  const [category, setCategory] = useState<WeddingMediaCategory>('reception');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load items
  useEffect(() => {
    let isMounted = true;
    fetchMediaVaultItems(INITIAL_WEDDING_MEMORIES).then((loaded) => {
      if (isMounted) {
        setItems(loaded);
        setLoading(false);
        if (onCountChange) onCountChange(loaded.length);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Update parent count when items change
  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items.length, onCountChange]);

  // Single file selection & preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 50 * 1024 * 1024) {
      setUploadError('File is too large! Please choose an image or short video under 50MB.');
      return;
    }

    setFile(selected);
    setUploadError('');

    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (dropped.size > 50 * 1024 * 1024) {
      setUploadError('File is too large! Please choose an image or short video under 50MB.');
      return;
    }

    setFile(dropped);
    setUploadError('');
    const url = URL.createObjectURL(dropped);
    setPreviewUrl(url);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Bulk files selection & queue management
  const handleBulkFilesSelect = (selectedFiles: FileList | File[]) => {
    const list = Array.from(selectedFiles);
    if (list.length === 0) return;

    const valid: QueuedBulkFile[] = [];
    let tooLarge = 0;

    list.forEach((f) => {
      if (f.size > 50 * 1024 * 1024) {
        tooLarge++;
        return;
      }
      valid.push({
        id: `bf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        isVideo: f.type.startsWith('video'),
        status: 'idle',
      });
    });

    if (tooLarge > 0) {
      setUploadError(`${tooLarge} file(s) exceeded the 50MB limit and were skipped.`);
    } else {
      setUploadError('');
    }

    setBulkFiles((prev) => [...prev, ...valid].slice(0, 30));
  };

  const handleBulkDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBulkFilesSelect(e.dataTransfer.files);
    }
  };

  const removeBulkFile = (id: string) => {
    setBulkFiles((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearAllBulkFiles = () => {
    bulkFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setBulkFiles([]);
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = '';
  };

  const resetAllUploadForms = () => {
    clearFile();
    clearAllBulkFiles();
    setAuthor('');
    setRelationship('');
    setCaption('');
    setUploadError('');
    setUploadSuccess(false);
    setBulkSuccessMessage('');
    setBulkProgress(null);
    setIsUploadOpen(false);
  };

  // Submit Upload (Single or Bulk)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setUploadError('Please enter your name.');
      return;
    }

    if (uploadMode === 'single') {
      if (!file) {
        setUploadError('Please select a photo or short video to upload.');
        return;
      }

      setUploading(true);
      setUploadError('');

      try {
        const newItem = await uploadMediaVaultItem({
          file,
          author,
          relationship,
          category,
          caption,
        });

        setItems((prev) => combineUniqueMediaItems([newItem, ...prev]));
        setUploading(false);
        setUploadSuccess(true);
        setBulkSuccessMessage('Your moment is now live on the site and saved in the wedding records.');

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D4AF37', '#6B0D25', '#F5E6D3', '#FCE7F3'],
          });
        } catch {}

        setTimeout(() => {
          resetAllUploadForms();
        }, 1800);
      } catch (err: any) {
        setUploading(false);
        setUploadError(err.message || 'Upload failed. Please try again.');
      }
    } else {
      // Bulk upload mode
      if (bulkFiles.length === 0) {
        setUploadError('Please select at least one photo or short video to upload.');
        return;
      }

      setUploading(true);
      setUploadError('');

      try {
        const filesToUpload = bulkFiles.map((b) => b.file);
        const result = await bulkUploadMediaVaultItems({
          files: filesToUpload,
          author,
          relationship,
          category,
          caption,
          onProgress: (p) => {
            const pct = Math.round((p.currentIndex / p.total) * 100);
            setBulkProgress({
              current: p.currentIndex,
              total: p.total,
              currentName: p.currentFileName,
              percent: pct,
            });

            setBulkFiles((prev) =>
              prev.map((item, idx) => {
                if (idx === p.currentIndex - 1) {
                  return {
                    ...item,
                    status: p.status === 'success' ? 'done' : p.status === 'error' ? 'error' : 'uploading',
                    error: p.error,
                  };
                }
                return item;
              })
            );

            if (p.item) {
              setItems((prev) => combineUniqueMediaItems([p.item!, ...prev]));
            }
          },
        });

        setUploading(false);
        if (result.successful.length > 0) {
          setUploadSuccess(true);
          setBulkSuccessMessage(
            `Successfully uploaded ${result.successful.length} of ${filesToUpload.length} moments to Google Drive and the wedding vault!`
          );

          try {
            confetti({
              particleCount: 140,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#D4AF37', '#6B0D25', '#F5E6D3', '#FCE7F3'],
            });
          } catch {}

          setTimeout(() => {
            resetAllUploadForms();
          }, 2400);
        } else {
          setUploadError('None of the files could be uploaded. Please verify your connection and try again.');
        }
      } catch (err: any) {
        setUploading(false);
        setUploadError(err.message || 'Batch upload failed. Please try again.');
      }
    }
  };

  // Like handler
  const handleLike = async (id: string) => {
    const success = await likeMediaVaultItem(id);
    if (success) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item))
      );
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesMedia = mediaFilter === 'all' || item.mediaType === mediaFilter;
    const matchesCat = catFilter === 'all' || item.category === catFilter;
    return matchesMedia && matchesCat;
  });

  const photoCount = items.filter((i) => i.mediaType === 'image').length;
  const videoCount = items.filter((i) => i.mediaType === 'video').length;

  // Lightbox keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredItems.length : null
        );
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, filteredItems.length]);

  const bulkPhotosCount = bulkFiles.filter((b) => !b.isVideo).length;
  const bulkVideosCount = bulkFiles.filter((b) => b.isVideo).length;
  const bulkTotalMB = (
    bulkFiles.reduce((acc, cur) => acc + cur.file.size, 0) /
    (1024 * 1024)
  ).toFixed(1);

  return (
    <div className="wedding-vault-wrapper">
      {/* Vault Hero Banner */}
      <div className="card card-gold vault-hero-card">
        <div className="vault-hero-content">
          <div className="vault-badge-tag">
            <Sparkles size={14} /> Celebration Concluded &amp; Sealed In Love <Sparkles size={14} />
          </div>
          <h3 className="heading-md vault-title">Official Wedding Memories Vault</h3>
          <p className="body-text vault-desc">
            The wedding of Ezinne &amp; Opeyemi has concluded! Relive the joyful vows, vibrant dances,
            and royal celebrations. Upload your own favorite moments from the day — photos and short
            videos are automatically preserved in the couple's archive!
          </p>

          <div className="vault-cta-group">
            <button
              className="btn btn-primary vault-upload-btn"
              onClick={() => {
                setUploadMode('single');
                setIsUploadOpen(true);
              }}
            >
              <UploadCloud size={18} /> Upload Moment
            </button>
            <button
              className="btn vault-bulk-btn"
              onClick={() => {
                setUploadMode('bulk');
                setIsUploadOpen(true);
              }}
              title="Select & upload multiple photos or short videos at once"
            >
              <Sparkles size={16} /> ⚡ Bulk Upload (Batch)
            </button>
            <button
              className="btn btn-outline vault-excel-btn"
              onClick={() => exportVaultToExcel(items)}
              title="Download spreadsheet of all uploaded memories & links"
            >
              <FileSpreadsheet size={16} /> Download Media Sheet (.xlsx)
            </button>
          </div>

          <div className="vault-stats-bar">
            <div className="vault-stat-item">
              <span className="vault-stat-num">{items.length}</span>
              <span className="vault-stat-label">Total Moments</span>
            </div>
            <div className="vault-stat-divider" />
            <div className="vault-stat-item">
              <span className="vault-stat-num">{photoCount}</span>
              <span className="vault-stat-label">Photos Shared</span>
            </div>
            <div className="vault-stat-divider" />
            <div className="vault-stat-item">
              <span className="vault-stat-num">{videoCount}</span>
              <span className="vault-stat-label">Short Videos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="vault-toolbar">
        <div className="vault-type-pills">
          <button
            className={`vault-pill ${mediaFilter === 'all' ? 'active' : ''}`}
            onClick={() => setMediaFilter('all')}
          >
            All Moments ({items.length})
          </button>
          <button
            className={`vault-pill ${mediaFilter === 'image' ? 'active' : ''}`}
            onClick={() => setMediaFilter('image')}
          >
            <ImageIcon size={14} /> Photos ({photoCount})
          </button>
          <button
            className={`vault-pill ${mediaFilter === 'video' ? 'active' : ''}`}
            onClick={() => setMediaFilter('video')}
          >
            <Film size={14} /> Short Videos ({videoCount})
          </button>
        </div>

        <div className="vault-cat-pills">
          {[
            { id: 'all', label: 'All Highlights' },
            { id: 'ceremony', label: 'Church Ceremony' },
            { id: 'reception', label: 'Reception & Party' },
            { id: 'traditional', label: 'Traditional Glam' },
            { id: 'candid', label: 'Candid Joy' },
          ].map((c) => (
            <button
              key={c.id}
              className={`vault-cat-pill ${catFilter === c.id ? 'active' : ''}`}
              onClick={() => setCatFilter(c.id as any)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {loading ? (
        <div className="vault-loading">
          <Loader2 className="animate-spin" size={32} />
          <p className="body-text">Loading memories vault...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card vault-empty-card">
          <Camera size={44} style={{ color: 'var(--gold)', margin: '0 auto 16px' }} />
          <h4 className="heading-sm">No memories found in this category</h4>
          <p className="small-text" style={{ maxWidth: 360, margin: '8px auto 20px' }}>
            Be the first guest to upload a moment here and share the love with Lydia &amp; Ope!
          </p>
          <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
            <UploadCloud size={16} /> Upload Now
          </button>
        </div>
      ) : (
        <div className="vault-grid">
          {filteredItems.map((item, index) => {
            const isVideo = item.mediaType === 'video';
            return (
              <div key={item.id} className="vault-card">
                <div
                  className="vault-media-container"
                  onClick={() => setLightboxIndex(index)}
                >
                  {isVideo ? (
                    <div className="vault-video-box">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.caption || 'Video thumbnail'}
                          className="vault-video-thumb-img"
                          loading="lazy"
                        />
                      ) : (
                        <video
                          key={item.localUrl || item.url}
                          src={item.localUrl || item.url}
                          className="vault-video-thumb"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      )}
                      <div className="vault-video-play-overlay">
                        <div className="vault-play-btn">
                          <Play size={20} fill="currentColor" />
                        </div>
                      </div>
                      <div className="vault-type-badge video-badge">
                        <Video size={12} /> Short Video
                      </div>
                    </div>
                  ) : (
                    <div className="vault-image-box">
                      <img src={item.url} alt={item.caption || 'Wedding memory'} loading="lazy" />
                      <div className="vault-type-badge photo-badge">
                        <Camera size={12} /> Photo
                      </div>
                    </div>
                  )}

                  <div className="vault-hover-overlay">
                    <Maximize2 size={20} />
                    <span>View Fullscreen</span>
                  </div>
                </div>

                <div className="vault-card-body">
                  <div className="vault-card-meta">
                    <span className="vault-category-tag">{item.category}</span>
                    <span className="small-text">{item.date}</span>
                  </div>

                  {item.caption && (
                    <p className="vault-caption">"{item.caption}"</p>
                  )}

                  <div className="vault-card-footer">
                    <div className="vault-author-info">
                      <div className="vault-author-avatar">
                        {item.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="vault-author-name">{item.author}</div>
                        <div className="vault-author-rel">{item.relationship}</div>
                      </div>
                    </div>

                    <button
                      className="vault-like-btn"
                      onClick={() => handleLike(item.id)}
                      title="Send love"
                    >
                      <Heart size={14} /> {item.likes}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="modal-overlay" onClick={() => !uploading && setIsUploadOpen(false)}>
          <div
            className="modal-box vault-upload-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => !uploading && setIsUploadOpen(false)}
              disabled={uploading}
            >
              <X size={20} />
            </button>

            <div className="modal-header">
              <div className="modal-header-icon">
                {uploadMode === 'bulk' ? <Layers size={24} /> : <UploadCloud size={24} />}
              </div>
              <h3 className="heading-md">Add to Wedding Memory Vault</h3>
              <p className="small-text">
                {uploadMode === 'bulk'
                  ? 'Batch upload multiple photos & short videos directly to the couple archive.'
                  : 'Upload photos or short videos to be saved to the public vault & wedding records.'}
              </p>

              {/* Mode Toggle Switcher */}
              <div className="vault-modal-tabs">
                <button
                  type="button"
                  className={`vault-modal-tab-btn ${uploadMode === 'single' ? 'active' : ''}`}
                  onClick={() => !uploading && setUploadMode('single')}
                  disabled={uploading}
                >
                  <Camera size={14} /> Single Moment
                </button>
                <button
                  type="button"
                  className={`vault-modal-tab-btn ${uploadMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => !uploading && setUploadMode('bulk')}
                  disabled={uploading}
                >
                  <Sparkles size={14} /> Bulk Upload (Batch)
                </button>
              </div>
            </div>

            {uploadSuccess ? (
              <div className="vault-success-state">
                <CheckCircle2 size={54} color="#059669" />
                <h4 className="heading-sm" style={{ marginTop: 16 }}>
                  Moments Uploaded Successfully!
                </h4>
                <p className="small-text" style={{ marginTop: 8, maxWidth: 380, margin: '8px auto 0' }}>
                  {bulkSuccessMessage || 'Your moments are now live on the site and saved in the wedding records.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="vault-upload-form">
                <div className="vault-modal-body-scroll">
                  {uploadError && <div className="vault-error-banner">{uploadError}</div>}

                  {/* SINGLE FILE MODE */}
                  {uploadMode === 'single' && (
                    <div
                      className={`vault-dropzone ${file ? 'has-file' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => !file && fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/mp4,video/webm,video/quicktime"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />

                      {previewUrl ? (
                        <div className="vault-preview-container">
                          {file?.type.startsWith('video') ? (
                            <video
                              src={previewUrl}
                              controls
                              className="vault-preview-media"
                            />
                          ) : (
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="vault-preview-media"
                            />
                          )}
                          <button
                            type="button"
                            className="vault-remove-file-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFile();
                            }}
                          >
                            <X size={16} /> Remove &amp; Choose Another
                          </button>
                        </div>
                      ) : (
                        <div className="vault-dropzone-prompt">
                          <div className="vault-dropzone-icon">
                            <Camera size={24} />
                            <Video size={24} />
                          </div>
                          <div className="vault-dropzone-title">
                            Click to select photo or short video
                          </div>
                          <p className="vault-dropzone-hint">
                            JPG, PNG, WEBP, MP4, MOV (Max 50MB)
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BULK UPLOAD MODE */}
                  {uploadMode === 'bulk' && (
                    <div>
                      <input
                        ref={bulkFileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/mp4,video/webm,video/quicktime"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files) handleBulkFilesSelect(e.target.files);
                        }}
                      />

                      {bulkFiles.length === 0 ? (
                        <div
                          className="vault-dropzone"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleBulkDrop}
                          onClick={() => bulkFileInputRef.current?.click()}
                        >
                          <div className="vault-dropzone-icon">
                            <Layers size={24} />
                            <Sparkles size={24} />
                          </div>
                          <div className="vault-dropzone-title">
                            Click or drag multiple photos &amp; short videos
                          </div>
                          <p className="vault-dropzone-hint">
                            Select up to 30 files at once • JPG, PNG, WEBP, MP4, MOV (Max 50MB each)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="vault-bulk-queue-header">
                            <div className="vault-bulk-summary-tag">
                              <Sparkles size={14} /> {bulkFiles.length} moments queued ({bulkPhotosCount} photos, {bulkVideosCount} videos • {bulkTotalMB} MB)
                            </div>
                            <button
                              type="button"
                              className="vault-bulk-clear-btn"
                              onClick={clearAllBulkFiles}
                              disabled={uploading}
                            >
                              Clear All
                            </button>
                          </div>

                          <div className="vault-bulk-files-grid">
                            {bulkFiles.map((bf) => (
                              <div key={bf.id} className="vault-bulk-thumb-card">
                                {bf.isVideo ? (
                                  <video
                                    src={bf.previewUrl}
                                    className="vault-bulk-thumb-img"
                                    muted
                                    playsInline
                                  />
                                ) : (
                                  <img
                                    src={bf.previewUrl}
                                    alt={bf.file.name}
                                    className="vault-bulk-thumb-img"
                                  />
                                )}
                                {!uploading && (
                                  <button
                                    type="button"
                                    className="vault-bulk-thumb-remove"
                                    onClick={() => removeBulkFile(bf.id)}
                                    title="Remove this moment"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                                <div className="vault-bulk-thumb-badge">
                                  {bf.isVideo ? 'Video' : 'Photo'}
                                </div>
                                <div className={`vault-bulk-thumb-status ${bf.status}`}>
                                  {bf.status === 'idle'
                                    ? 'Ready'
                                    : bf.status === 'uploading'
                                    ? 'Uploading...'
                                    : bf.status === 'done'
                                    ? '✓ Uploaded'
                                    : '✗ Failed'}
                                </div>
                              </div>
                            ))}

                            {!uploading && bulkFiles.length < 30 && (
                              <button
                                type="button"
                                className="vault-bulk-add-more-btn"
                                onClick={() => bulkFileInputRef.current?.click()}
                                title="Add more moments to queue"
                              >
                                <Plus size={20} />
                                <span>Add More</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Live Progress Bar when Uploading */}
                      {uploading && bulkProgress && (
                        <div className="vault-bulk-progress-box">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: 'var(--burgundy)',
                            }}
                          >
                            <span>
                              Uploading moment {bulkProgress.current} of {bulkProgress.total}...
                            </span>
                            <span>{bulkProgress.percent}%</span>
                          </div>
                          <div className="vault-progress-bar-bg">
                            <div
                              className="vault-progress-bar-fill"
                              style={{ width: `${bulkProgress.percent}%` }}
                            />
                          </div>
                          <div
                            className="small-text"
                            style={{
                              fontSize: '0.72rem',
                              marginTop: 4,
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            Current: {bulkProgress.currentName}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Form fields */}
                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="form-label">Your Name *</label>
                    <input
                      className="form-input"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Ebuka Okafor / The Adeleke Family"
                      disabled={uploading}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Relationship to Couple</label>
                      <input
                        className="form-input"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        placeholder="e.g. Groom's Friend, Cousin"
                        disabled={uploading}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Highlight Category</label>
                      <select
                        className="form-input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        disabled={uploading}
                      >
                        <option value="reception">Reception &amp; Party</option>
                        <option value="ceremony">Holy Matrimony (Church)</option>
                        <option value="traditional">Traditional &amp; Cultural</option>
                        <option value="friends">Friends &amp; Family Squad</option>
                        <option value="candid">Candid &amp; Fun Moments</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {uploadMode === 'bulk' ? 'Album Caption or Loving Note (Applied to batch)' : 'Caption or Loving Note'}
                    </label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Describe this unforgettable moment or wish for Ezinne & Opeyemi..."
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="vault-modal-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => resetAllUploadForms()}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading || (uploadMode === 'single' ? !file : bulkFiles.length === 0)}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />{' '}
                        {uploadMode === 'bulk'
                          ? `Saving ${bulkProgress?.current || 1} of ${bulkFiles.length}...`
                          : 'Saving to Memory Vault...'}
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />{' '}
                        {uploadMode === 'bulk'
                          ? `Post All (${bulkFiles.length}) Moments To Vault`
                          : 'Post To Vault'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX (Photos & Playable Videos) */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (() => {
        const currentItem = filteredItems[lightboxIndex];
        const driveId = currentItem.driveId || extractDriveId(currentItem.url, currentItem.id);
        const playableLocalUrl = currentItem.localUrl || (currentItem.url?.startsWith('/') ? currentItem.url : null);
        const isDriveUrl = currentItem.url?.includes('drive.google.com');
        const shouldUseEmbed = forceEmbedPlayer || (Boolean(isDriveUrl) && !playableLocalUrl);

        return (
          <div className="lightbox" onClick={() => setLightboxIndex(null)}>
            <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
              <button
                className="lightbox-close"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <button
                className="lightbox-nav lightbox-prev"
                onClick={() => {
                  setForceEmbedPlayer(false);
                  setLightboxIndex(
                    (lightboxIndex - 1 + filteredItems.length) % filteredItems.length
                  );
                }}
                aria-label="Previous"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="lightbox-nav lightbox-next"
                onClick={() => {
                  setForceEmbedPlayer(false);
                  setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
                }}
                aria-label="Next"
              >
                <ChevronRight size={22} />
              </button>

              {currentItem.mediaType === 'video' ? (
                <div className="lightbox-video-container">
                  {shouldUseEmbed && driveId ? (
                    <iframe
                      src={`https://drive.google.com/file/d/${driveId}/preview`}
                      className="lightbox-video-frame"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      title={currentItem.caption || 'Wedding Video'}
                    />
                  ) : (
                    <video
                      key={playableLocalUrl || currentItem.url}
                      controls
                      autoPlay
                      playsInline
                      preload="auto"
                      className="lightbox-media"
                      onError={() => {
                        if (driveId) setForceEmbedPlayer(true);
                      }}
                      style={{
                        maxHeight: '72vh',
                        maxWidth: '100%',
                        borderRadius: 'var(--radius-md)',
                        background: '#000',
                      }}
                    >
                      {playableLocalUrl && <source src={playableLocalUrl} type="video/mp4" />}
                      <source src={currentItem.url} type="video/mp4" />
                      <source src={currentItem.url} type="video/quicktime" />
                      <source src={currentItem.url} type="video/webm" />
                      Your browser does not support video playback.
                    </video>
                  )}

                  {driveId && playableLocalUrl && (
                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => setForceEmbedPlayer(!shouldUseEmbed)}
                        className="vault-player-toggle-btn"
                      >
                        {shouldUseEmbed ? 'Switch to Direct Video Player' : 'Switch to Google Drive HD Player'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={currentItem.url}
                  alt={currentItem.caption || 'Wedding memory'}
                  className="lightbox-media"
                />
              )}

              <div className="vault-lightbox-caption-card">
                <div className="label">
                  {currentItem.category.toUpperCase()} •{' '}
                  {lightboxIndex + 1} of {filteredItems.length}
                </div>
                <div className="heading-sm" style={{ color: 'white', marginTop: 4 }}>
                  Shared by {currentItem.author}{' '}
                  <span style={{ fontSize: '0.82rem', opacity: 0.8, fontWeight: 400 }}>
                    ({currentItem.relationship})
                  </span>
                </div>
                {currentItem.caption && (
                  <p
                    className="small-text"
                    style={{ color: 'rgba(255,255,255,0.92)', marginTop: 6, fontStyle: 'italic' }}
                  >
                    "{currentItem.caption}"
                  </p>
                )}

                {/* LUXURIOUS HIGH-CONTRAST ACTION BUTTONS */}
                <div className="vault-lightbox-actions">
                  {currentItem.mediaType === 'video' ? (
                    <>
                      {driveId ? (
                        <a
                          href={`https://drive.google.com/file/d/${driveId}/view?usp=sharing`}
                          target="_blank"
                          rel="noreferrer"
                          className="vault-btn-gold"
                        >
                          <ExternalLink size={16} /> Watch in Full Google Player
                        </a>
                      ) : (
                        <a
                          href={playableLocalUrl || currentItem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="vault-btn-gold"
                        >
                          <ExternalLink size={16} /> Open Full Video
                        </a>
                      )}
                      <a
                        href={playableLocalUrl || (driveId ? `https://drive.google.com/uc?export=download&id=${driveId}` : currentItem.url)}
                        download={currentItem.fileName || 'wedding_moment.mp4'}
                        target="_blank"
                        rel="noreferrer"
                        className="vault-btn-burgundy"
                      >
                        <Download size={16} /> Download Video (MP4)
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href={currentItem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="vault-btn-gold"
                      >
                        <ExternalLink size={16} /> View High-Resolution Photo
                      </a>
                      <a
                        href={currentItem.url}
                        download={currentItem.fileName || 'wedding_photo.jpg'}
                        target="_blank"
                        rel="noreferrer"
                        className="vault-btn-burgundy"
                      >
                        <Download size={16} /> Download Photo
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
