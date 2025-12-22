import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import AdminLayout from './AdminLayout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../components/QuillEditor.css';

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    author: '',
    category: 'algemeen',
    is_published: false,
  });

  useEffect(() => {
    if (isEdit) {
      fetchArticle();
    }
  }, [id]);

  async function fetchArticle() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFormData(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      alert('Artikel niet gevonden');
      navigate('/admin/articles');
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from title
    if (name === 'title' && !isEdit) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (image or video)
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Alleen afbeeldingen en video\'s zijn toegestaan');
      return;
    }

    // Validate file size (10MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`${isVideo ? 'Video' : 'Afbeelding'} mag maximaal ${isVideo ? '50' : '10'}MB zijn`);
      return;
    }

    setUploading(true);

    try {
      // Create unique filename with original extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage with high quality settings
      const { data, error } = await supabase.storage
        .from('article-images')
        .upload(filePath, file, {
          cacheControl: '31536000', // 1 jaar cache voor betere performance
          upsert: false,
          contentType: file.type, // Behoud originele content type
          duplex: 'half'
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      // Update form with image URL
      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      alert(`✅ ${isVideo ? 'Video' : 'Afbeelding'} geüpload met originele kwaliteit!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fout bij uploaden: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        published_at: formData.is_published && !isEdit ? new Date().toISOString() : formData.published_at
      };

      if (isEdit) {
        const { error } = await supabase
          .from('articles')
          .update(dataToSave)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([dataToSave]);

        if (error) throw error;
      }

      alert(isEdit ? 'Artikel bijgewerkt!' : 'Artikel aangemaakt!');
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Fout bij opslaan: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">
            {isEdit ? 'Artikel Bewerken' : 'Nieuw Artikel'}
          </h2>
          <p className="text-zinc-400">
            {isEdit ? 'Wijzig het artikel' : 'Voeg een nieuw artikel toe aan de kennisbank'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Titel *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2">URL Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                required
              />
              <p className="text-xs text-zinc-500 mt-1">
                Wordt automatisch gegenereerd. Preview: /kennisbank/{formData.slug}
              </p>
            </div>

            {/* Category & Author */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Categorie</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-primary outline-none"
                >
                  <option value="algemeen">Algemeen</option>
                  <option value="islam-basics">Islam Basics</option>
                  <option value="gebed">Gebed</option>
                  <option value="ramadan">Ramadan</option>
                  <option value="hadith">Hadith</option>
                  <option value="koran">Koran</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Auteur</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-primary outline-none"
                  placeholder="Naam van de auteur"
                />
              </div>
            </div>

            {/* Media Upload (Image or Video) */}
            <div>
              <label className="block text-sm font-medium mb-2">Header Media (Afbeelding of Video)</label>
              
              {/* Upload Button */}
              <div className="flex gap-3 mb-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all border-2 border-transparent hover:border-primary/50">
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Uploaden...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>📸🎥 Upload Media</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {/* Or use URL */}
                <div className="flex-1">
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-primary outline-none"
                    placeholder="Of plak een URL..."
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Media Preview */}
              {formData.image_url && (
                <div className="relative group">
                  {formData.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || formData.image_url.includes('video') ? (
                    <video
                      src={formData.image_url}
                      controls
                      className="w-full h-64 object-cover rounded-lg border-2 border-zinc-700"
                    />
                  ) : (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border-2 border-zinc-700"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <p className="text-xs text-zinc-500 mt-2">
                💡 Upload een afbeelding (max 10MB) of video (max 50MB) met originele kwaliteit, of plak een URL. Aanbevolen: 1200x630px
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium mb-2">Samenvatting</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:border-primary outline-none resize-none"
                placeholder="Korte samenvatting voor op de overzichtspagina"
              />
            </div>

            {/* Content - Rich Text Editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">
                  ✍️ Artikel Inhoud *
                </label>
                {/* Preview Toggle */}
                <div className="flex gap-2 bg-zinc-800 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      !previewMode 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ✏️ Bewerken
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      previewMode 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    👁️ Preview
                  </button>
                </div>
              </div>

              {/* Editor View */}
              {!previewMode && (
                <>
                  <div className="article-editor shadow-lg">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(value) => setFormData({ ...formData, content: value })}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, 4, false] }],
                          [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'color': [] }, { 'background': [] }],
                          [{ 'script': 'sub'}, { 'script': 'super' }],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                          [{ 'direction': 'rtl' }, { 'align': [] }],
                          ['blockquote', 'code-block'],
                          ['link', 'image', 'video'],
                          ['clean']
                        ],
                        clipboard: {
                          matchVisual: true,
                          matchers: []
                        }
                      }}
                      formats={[
                        'header', 'font', 'size',
                        'bold', 'italic', 'underline', 'strike',
                        'color', 'background',
                        'script',
                        'list', 'bullet', 'indent',
                        'direction', 'align',
                        'blockquote', 'code-block',
                        'link', 'image', 'video'
                      ]}
                      placeholder="Begin hier met typen... Gebruik de toolbar om tekst te formatteren zoals in Word."
                    />
                  </div>
                  <div className="mt-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400 flex items-start gap-2 mb-3">
                      <span className="text-lg">💡</span>
                      <span>
                        <strong>Tips:</strong> Selecteer tekst om deze vet, cursief of gekleurd te maken. 
                        Gebruik de dropdown voor headers (H1-H4). Voor Arabische tekst: gebruik het RTL-icoon (◄) in de toolbar.
                      </span>
                    </p>
                    <div className="border-t border-blue-500/20 pt-3 mt-3 space-y-2">
                      <p className="text-sm text-blue-300 font-semibold">📸 Afbeeldingen toevoegen:</p>
                      <p className="text-xs text-blue-300/80">Klik op het 🖼️ icoon in de toolbar en plak de URL van je afbeelding (bijv. van Unsplash of je eigen hosting).</p>
                      
                      <p className="text-sm text-blue-300 font-semibold mt-3">🎥 YouTube video's embedden:</p>
                      <p className="text-xs text-blue-300/80">
                        1. Klik op het ▶️ icoon in de toolbar<br/>
                        2. Plak de YouTube video URL (bijv. https://www.youtube.com/watch?v=VIDEO_ID)<br/>
                        3. De video wordt automatisch geëmbed!
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Preview View */}
              {previewMode && (
                <div className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-green-600/10 px-6 py-3 border-b border-zinc-200">
                    <p className="text-sm text-zinc-600 font-medium">👁️ Artikel Preview</p>
                  </div>
                  <div className="p-8">
                    {formData.image_url && (
                      formData.image_url.match(/\.(mp4|webm|ogg|mov)$/i) || formData.image_url.includes('video') ? (
                        <video
                          src={formData.image_url}
                          controls
                          className="w-full h-64 object-cover rounded-lg mb-6"
                        />
                      ) : (
                        <img
                          src={formData.image_url}
                          alt={formData.title}
                          className="w-full h-64 object-cover rounded-lg mb-6"
                        />
                      )
                    )}
                    {formData.title && (
                      <h1 className="text-4xl font-bold text-zinc-900 mb-4">
                        {formData.title}
                      </h1>
                    )}
                    {formData.excerpt && (
                      <p className="text-lg text-zinc-600 mb-6 italic">
                        {formData.excerpt}
                      </p>
                    )}
                    <div 
                      className="prose prose-lg max-w-none prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-a:text-primary prose-strong:text-zinc-900 prose-ul:text-zinc-700 prose-ol:text-zinc-700"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                    {!formData.content && (
                      <p className="text-zinc-400 italic">
                        Nog geen inhoud... Schakel naar Bewerken om te beginnen met typen.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Publish */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_published"
                id="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary"
              />
              <label htmlFor="is_published" className="text-sm font-medium">
                Direct publiceren
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-primary to-amber-400 text-black font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50"
            >
              {saving ? 'Bezig met opslaan...' : (isEdit ? 'Bijwerken' : 'Aanmaken')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/articles')}
              className="px-6 py-3 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
